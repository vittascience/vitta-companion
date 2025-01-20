import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import vittaLogo from '../assets/data/images/vittascience.jpg';
import NaoImage from '../assets/data/images/nao.png';
import { CirclesWithBar, ProgressBar } from 'react-loader-spinner';

const Nao = () => {
	const [vittaConnectStatus, setVittaConnectStatus] = useState<boolean>(false);
	const [codeRunning, setCodeRunning] = useState<boolean>(false);
	const [naoQiConnectStatus, setNaoQiConnectStatus] = useState<boolean>(false);

	useEffect(() => {
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
		const connectStatusListener = (_event: any, { isNaoQiConnected, isVittaConnected }: { isNaoQiConnected: boolean; isVittaConnected: boolean }) => {
			setNaoQiConnectStatus(isNaoQiConnected);
			setVittaConnectStatus(isVittaConnected);
		};

		window.ipcRenderer.on('connectStatusUpdated', connectStatusListener);

		// Initial fetch for connection status
		window.ipcRenderer.invoke('getConnectStatus').then(({ isNaoQiConnected, isVittaConnected }) => {
			setNaoQiConnectStatus(isNaoQiConnected);
			setVittaConnectStatus(isVittaConnected);
		});

		// listeners cleanup
		return () => {
			window.ipcRenderer.removeListener('connectStatusUpdated', connectStatusListener);
			window.ipcRenderer.removeAllListeners('connectStatusUpdated');
		};
	}, []);

	return (
		<div className="min-h-screen  p-4">
			<Link to="/" className="mb-4 inline-block">
				<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Home</button>
			</Link>
			<h2 className="text-3xl font-semibold text-center mb-8">NAO V6</h2>
			<div className="grid grid-cols-5 gap-4 items-center justify-center">
				<div className={`interface_card ${vittaConnectStatus ? 'bg-flow-green-left' : 'bg-flow-red-left'}`}>
					<img src={vittaLogo} alt="Vittascience Logo" className="w-full h-full object-contain" />
				</div>

				<div className="flex justify-center">
					<ProgressBar
						height="80"
						width="80"
						ariaLabel="progress-bar-loading"
						borderColor="#22b573"
						barColor="#22b573"
						visible={vittaConnectStatus}
					/>
				</div>

				<div className="text-center font-medium text-lg">Companion APP</div>

				<div className="flex justify-center">
					<ProgressBar
						height="80"
						width="80"
						ariaLabel="progress-bar-loading"
						borderColor="#22b573"
						barColor="#22b573"
						visible={naoQiConnectStatus}
					/>
				</div>

				<div className={`interface_card ${naoQiConnectStatus ? 'bg-flow-green-right' : 'bg-flow-red-right'}`}>
					<img src={NaoImage} alt="NAO Logo" className="w-full h-full object-contain" />
				</div>
			</div>

			<div className="mt-6 text-center">
				<p className="text-lg font-medium">
					{codeRunning ? "Programme en cours d'exécution" : "Aucun programme en cours d'exécution"}
				</p>
			</div>

			<div className="flex justify-center items-center h-40">
				{codeRunning && (
					<CirclesWithBar
						height="100"
						width="100"
						color="#4fa94d"
						ariaLabel="circles-with-bar-loading"
						visible={true}
					/>
				)}
			</div>
		</div>
	);
};

export default Nao;