// import { useState } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import vittaLogo from '../assets/data/images/vittascience.jpg';
import Ned2 from '../assets/data/images/ned2.jpg';
import { CirclesWithBar, ProgressBar } from 'react-loader-spinner';

const NiryoPage = () => {
	const [rosConnectStatus, setRosConnectStatus] = useState<boolean>(false);
	const [vittaConnectStatus, setVittaConnectStatus] = useState<boolean>(false);
	const [codeRunning, setCodeRunning] = useState<boolean>(false);

	useEffect(() => {
		console.log('useEffect codeRunning');
		const codeRunningListener = (_event: any, status: boolean) => {
			setCodeRunning(status);
		};

		window.ipcRenderer.on('codeRunningStatusUpdated', codeRunningListener);

		window.ipcRenderer.invoke('getCodeRunningStatus').then((status) => {
			setCodeRunning(status);
		});

		return () => {
			window.ipcRenderer.removeListener('codeRunningStatusUpdated', codeRunningListener);
			window.ipcRenderer.removeAllListeners('codeRunningStatusUpdated');
		};
	}, []);

	useEffect(() => {
		const connectStatusListener = (_event: any, { isRosConnected, isVittaConnected }: { isRosConnected: boolean; isVittaConnected: boolean }) => {
			setRosConnectStatus(isRosConnected);
			setVittaConnectStatus(isVittaConnected);
		};

		window.ipcRenderer.on('connectStatusUpdated', connectStatusListener);

		// Initial fetch for connection status
		window.ipcRenderer.invoke('getConnectStatus').then(({ isRosConnected, isVittaConnected }) => {
			setRosConnectStatus(isRosConnected);
			setVittaConnectStatus(isVittaConnected);
		});

		// listeners cleanup
		return () => {
			window.ipcRenderer.removeListener('connectStatusUpdated', connectStatusListener);
			window.ipcRenderer.removeAllListeners('connectStatusUpdated');
		};
	}, []);

	return (
		<>
			<Link to="/">
				<button className="mb-8">Home</button>
			</Link>
			<div className="mb-8">Robot Niryo Ned2</div>
			<div className="flex items-center justify-around">
				<div className={`interface_card ${vittaConnectStatus ? 'bg-flow-green-left' : 'bg-flow-red-left'}`}>
					<img
						src={vittaLogo}
						alt="Vittascience Logo"
						className="w-full object-contain"
					/>
				</div>
				{/* <div className={`cable ${vittaConnectStatus ? 'bg-flow-green-left' : 'bg-flow-red-left'}`}></div> */}

				<div className='w-24'>
					<ProgressBar
						height="80"
						width="80"
						ariaLabel="progress-bar-loading"
						wrapperStyle={{}}
						wrapperClass="progress-bar-wrapper"
						borderColor="#22b573"
						barColor="#22b573"
						visible={vittaConnectStatus ? true : false}
					/>
				</div>

				<div>companion APP</div>
				<div className='w-24'>
					<ProgressBar
						height="80"
						width="80"
						ariaLabel="progress-bar-loading"
						wrapperStyle={{}}
						wrapperClass="progress-bar-wrapper"
						borderColor="#22b573"
						barColor="#22b573"
						visible={rosConnectStatus ? true : false}
					/>
				</div>
				<div className={`interface_card ${rosConnectStatus ? 'bg-flow-green-right' : 'bg-flow-red-right'}`}>
					<img
						src={Ned2}
						alt="Ned2 Logo"
						className="w-full object-contain"
					/>
				</div>
			</div>
			<div className="my-4">{codeRunning ? 'Programme en cours d\'exécution' : "Aucun programme en cours d'exécution"}</div>
			<div className="h-40 w-full flex justify-center items-center">
				{codeRunning && (
					<>
						<CirclesWithBar
							height="100"
							width="100"
							color="#4fa94d"
							wrapperStyle={{}}
							wrapperClass=""
							visible={true}
							outerCircleColor=""
							innerCircleColor=""
							barColor=""
							ariaLabel="circles-with-bar-loading"
						/>
					</>
				)}
			</div>
		</>
	);
};

export default NiryoPage;
