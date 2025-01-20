const http = require('http');
const { Server } = require('socket.io');
const ROSLIB = require('roslib');
// const { NodeSSH } = require('node-ssh');
// const os = require('node:os');
// const path = require('node:path');
// const fs = require('node:fs');
import { ipcMain } from 'electron';

export default class MainNiryo {
	ipAdress: string;
	ros: any;
	isRosConnected: boolean;
	isVittaConnected: boolean;
	io: any;
	socket: any;
	server: any;
	window: any;
	status: boolean;
	calibrationTopic: any;
	gripperTopic: any;
	jointStatesTopic: any;
	ledRingTopic: any;
	savePoseTopic: any;
	robotActionResultTopic: any;

	// static instance: MainNiryo;

	constructor(niryoIpAdress: string, win: any) {
		// if (!MainNiryo.instance) {
		// 	MainNiryo.instance = this;
		// }
		this.ipAdress = niryoIpAdress;
		this.window = win;
		this.ros = null;
		this.isRosConnected = false;
		this.isVittaConnected = false;
		this.init();
		this.initIpc();
		// this.subscribeToTopic();
		// this.io = null;
		// this.ros = null;
		this.status = false;
		// return MainNiryo.instance;
	}

	init() {
		this.server = http.createServer();
		this.io = new Server(this.server, {
			cors: {
				origin: '*', // Remplacez par l'adresse de votre client
				methods: ['GET', 'POST'],
			},
		});

		this.io.on('connection', (socket: any) => {
			// console.log('connected');
			this.socket = socket;
			this.socket.emit('message', 'connected');
			this.isVittaConnected = true;
			this.updateConnectionStatus();

			this.socket.on('ros_connect', (msg: any) => {
				console.log(msg);
				this.ros = new ROSLIB.Ros({
					url: 'ws://' + this.ipAdress + ':9090',
				});
				this.ros.on('connection', () => {
					this.isRosConnected = true;
					this.updateConnectionStatus();
					socket.emit('ros_connected', 'connected');
					this.unsubscribeAllTopics();
					this.subscribeToTopic();
				});

				this.ros.on('error', (error: string) => {
					this.isRosConnected = false;
					this.updateConnectionStatus();
					console.log('Error connecting to ROS websocket server: ', error);
				});

				this.ros.on('close', () => {
					this.isRosConnected = false;
					this.updateConnectionStatus();
					console.log('Connection to ROS websocket server closed.');
				});
			});

			this.socket.on('launch_movement', (msg: any) => {
				this.status = true;
				this.updateCodeRunningStatus();
				this.sendPythonCode(msg.data);
			});

			this.socket.on('stop_movement', async () => {
				await this.stopPythonCode();
			});

			this.socket.on('disconnect_request', () => {
				console.log('disconnected');
				this.isVittaConnected = false;
				this.isRosConnected = false;
				this.updateConnectionStatus();
			});
		});

		this.io.on('disconnect', () => {
			console.log('disconnected');
			this.isVittaConnected = false;
			this.isRosConnected = false;
			this.updateConnectionStatus();
		});

		this.server.on('error', (error: any) => {
			if (error.message === 'EADDRINUSE') {
				console.log('Error: Address in use');
				setTimeout(() => {
					this.server.listen(8887);
				}, 1000);
			}
		});

		this.server.listen(8887);
	}

	initIpc() {
		ipcMain.removeHandler('getCodeRunningStatus'); // Supprime le handler s'il existe
		ipcMain.handle('getCodeRunningStatus', () => {
			return this.status;
		});

		ipcMain.removeHandler('getConnectStatus'); // Supprime le handler s'il existe
		ipcMain.handle('getConnectStatus', () => {
			return { isRosConnected: this.isRosConnected, isVittaConnected: this.isVittaConnected };
		});
	}

	updateConnectionStatus() {
		if (this.window !== null) {
			this.window.webContents.send('connectStatusUpdated', { isRosConnected: this.isRosConnected, isVittaConnected: this.isVittaConnected });
		}
	}

	updateCodeRunningStatus() {
		if (this.window !== null) {
			this.window.webContents.send('codeRunningStatusUpdated', this.status);
		}
	}

	unsubscribeAllTopics() {
		if (this.calibrationTopic) {
			this.calibrationTopic.unsubscribe();
		}
		if (this.gripperTopic) {
			this.gripperTopic.unsubscribe();
		}
		if (this.jointStatesTopic) {
			this.jointStatesTopic.unsubscribe();
		}
		if (this.ledRingTopic) {
			this.ledRingTopic.unsubscribe();
		}
		if (this.savePoseTopic) {
			this.savePoseTopic.unsubscribe();
		}
		if (this.robotActionResultTopic) {
			this.robotActionResultTopic.unsubscribe();
		}
	}

	subscribeToTopic() {
		this.calibrationTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/niryo_robot_status/robot_status',
			messageType: 'niryo_robot_status/RobotStatus',
		});

		this.calibrationTopic.subscribe((message: any) => {
			if (message.robot_message === 'Calibration Needed') {
				this.socket.emit('need_calibration', 'true');
			} else if (message.robot_message === 'Standby, nothing else to say') {
				this.socket.emit('need_calibration', 'false');
			}
		});

		this.gripperTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/niryo_robot_tools_commander/action_server/goal',
			messageType: 'niryo_robot_tools_commander/ToolActionGoal',
		});
		this.gripperTopic.subscribe((message: string) => {
			this.socket.emit('gripper_position', message);
			// console.log('Received gripper position: ', message);
		});

		this.jointStatesTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/joint_states',
			messageType: 'sensor_msgs/JointState',
		});
		this.jointStatesTopic.subscribe((message: string) => {
			this.socket.emit('joint_states', message);
		});

		this.ledRingTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/niryo_robot_led_ring/led_ring_status',
			messageType: 'niryo_robot_led_ring/LedRingStatus',
		});

		this.ledRingTopic.subscribe((message: any) => {
			// console.log(message);
			this.socket.emit('led_ring_status', message);
		});

		this.savePoseTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/niryo_robot_hardware_interface/end_effector_interface/save_pos_button_status',
			messageType: 'end_effector_interface/EEButtonStatus',
		});

		this.savePoseTopic.subscribe((message: any) => {
			this.socket.emit('free_motion__save_status', message);
		});

		this.robotActionResultTopic = new ROSLIB.Topic({
			ros: this.ros,
			name: '/niryo_robot_arm_commander/robot_action/result',
			messageType: 'niryo_robot_arm_commander/RobotMoveActionResult',
		});

		this.robotActionResultTopic.subscribe((message: any) => {
			// console.log(message.result.message);
			this.socket.emit('robot_action_result', message.result.message);
		});
	}

	async sendPythonCode(code: string) {
		// const ssh = new NodeSSH();
		// try {
		// 	const tempFilePath = path.join(os.tmpdir(), 'vittaTempScript.py');
		// 	fs.writeFileSync(tempFilePath, code);

		// 	await ssh.connect({
		// 		host: this.ipAdress,
		// 		username: 'niryo',
		// 		port: 22,
		// 		password: 'robotics',
		// 	});

		// 	await ssh.putFile(tempFilePath, '/home/niryo/vittaTempScript.py');
		// 	const result = await ssh.execCommand('export PYTHONPATH=/home/niryo/catkin_ws/install/release/ned2/lib/python3/dist-packages:/opt/ros/noetic/lib/python3/dist-packages && python3 /home/niryo/vittaTempScript.py');

		// 	console.log('STDOUT: ' + result.stdout);

		// 	if (result.stdout.match(/END_OFF_PROGRAMME/g)) {
		// 		this.status = false;
		// 		this.updateCodeRunningStatus();
		// 	}

		// 	console.log('STDERR: ' + result.stderr);
		// 	const suppressFile = await ssh.execCommand('rm /home/niryo/vittaTempScript.py');
		// 	console.log('STDOUT: ' + suppressFile.stdout);
		// 	console.log('STDERR: ' + suppressFile.stderr);

		// 	await ssh.dispose();
		// } catch (error) {
		// 	console.log(error);
		// }
		try {
			var executeProgramService = new ROSLIB.Service({
				ros: this.ros,
				name: '/niryo_robot_programs_manager/execute_program',
				serviceType: 'niryo_robot_programs_manager/ExecuteProgram',
			});
			var request = new ROSLIB.ServiceRequest({
				execute_from_string: true,
				name: 'my_program',
				code_string: code,
				language: {
					used: 1,
				},
			});
			executeProgramService.callService(request, (result: any) => {
				if (JSON.stringify(result).match(/END_OFF_PROGRAMME/g)) {
					this.status = false;
					this.socket.emit('program_ended', 'programme_ended');
					this.updateCodeRunningStatus();
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async stopPythonCode() {
		try {
			var stopProgramService = new ROSLIB.Service({
				ros: this.ros,
				name: '/niryo_robot_programs_manager/stop_program',
				serviceType: 'niryo_robot_msgs/Trigger',
			});
			var request = new ROSLIB.ServiceRequest({
				// no data to send to the service
			});
			stopProgramService.callService(request, (result: any) => {
				this.status = false;
				this.socket.emit('program_ended', result.message);
				this.updateCodeRunningStatus();
				return;
			});
		} catch (error) {
			return console.log(error);
		}
	}

	async disconnect() {
		// if (this.server){
		// 	console.log('Closing server');
		// 	await this.server.close();
		// 	console.log('Server closed', "this.io: ", this.io);
		// }
		// console.log("io connection", this.io)

		// remove all ipcMain handlers
		ipcMain.removeHandler('getCodeRunningStatus');
		ipcMain.removeHandler('getConnectStatus');

		try {
			if (this.io) {
				await this.io.httpServer.close();
				await this.io.close();
			}
		} catch (error) {
			console.log(error);
		}

		if (this.ros) {
			await this.ros.close();
		}
		// console.log('ROS connection closed');
		this.isRosConnected = false;
		// this.updateConnectionStatus();
	}
}
