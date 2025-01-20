import { Link } from 'react-router-dom';
import Ned2 from '../assets/data/images/ned2.jpg';
// import Raspberry from '../assets/data/images/raspberry.jpg';
import Nao from '../assets/data/images/nao.png';
import { useEffect, useState } from 'react';


const Home = () => {

	const [messageUpdate, setMessageUpdate] = useState<string>('');
	const [platform, setPlatform] = useState<string>('win');
	const [downloadLink, setDownloadLink] = useState<string>('');
	const [_selectedRobot, setSelectedRobot] = useState<string | null>(null);
	
	useEffect(() => {

		window.ipcRenderer.on("os", (_, os) => {
			console.log(os);
			if (os === 'win') {
				setPlatform('win');
			} else if (os === 'mac') {
				setPlatform('mac');
			} else if (os === 'linux') {
				setPlatform('linux');
			}
		});


		window.ipcRenderer.on('update_available', (_, version) => {
			console.log(version, platform);
			const newVersion = version.version;
			if (version.platform === 'win') {
				setDownloadLink(`https://github.com/Nixoals/vitta-companion/releases/download/${newVersion}/VittaCompanion_Setup_${newVersion.replace('v', '')}.exe`);
			} else if (version.platform === 'mac') {
				setDownloadLink(`https://github.com/Nixoals/vitta-companion/releases/download/${newVersion}/VittaCompanion_${newVersion.replace('v', '')}_arm64.dmg`);
			} else if (version.platform === 'linux') {
				setDownloadLink(`https://github.com/Nixoals/vitta-companion/releases/download/${newVersion}/VittaCompanion_${newVersion.replace('v', '')}_amd64.deb`);
			}
			console.log(downloadLink);
			setMessageUpdate('une mise à jour est disponible');

		});

		window.ipcRenderer.on('update_downloaded', () => {
			// Demandez à l'utilisateur s'il souhaite redémarrer l'application pour installer la mise à jour
			console.log('une mise à jour est téléchargée');
		});

		return () => {
			window.ipcRenderer.removeAllListeners('update_available');
			window.ipcRenderer.removeAllListeners('update_downloaded');
			window.ipcRenderer.removeAllListeners('os');
		};
	}, []);

	const handleRobotSelection = (robot: string) => {
		setSelectedRobot(robot);
		window.ipcRenderer.send('select-robot', robot); // Envoie au processus principal le robot sélectionné
	};

	const handleDownload = () => {
        // Ouvrir le lien de téléchargement dans une nouvelle fenêtre
		console.log(downloadLink);
        window.ipcRenderer.send('download', downloadLink)
    };
	return (
		<section>
			<div className="text-2xl mb-12">Choisissez une interface</div>
			<div>
				<div className="flex justify-center items-center gap-2">
					<div className="flex flex-col">
						<Link to="/niryo" onClick={() => handleRobotSelection('niryo')}>
							<div className="interface_card">
								<img
									src={Ned2}
									alt="Niryo"
									className="w-full object-contain"
								/>
							</div>
						</Link>
						<div>Niryo Ned2</div>
					</div>
					{/* <div className="flex flex-col">
						<Link to="/raspberry">
							<div className=" interface_card">
								<img
									src={Raspberry}
									alt="Niryo"
									className="w-full h-full object-contain"
								/>
							</div>
						</Link>
						<div>Raspberry</div>
					</div> */}
					<div className="flex flex-col">
						<Link to="/nao" onClick={() => handleRobotSelection('nao')}>
							<div className="interface_card">
								<img
									src={Nao}
									alt="Niryo"
									className="w-full h-full object-contain"
								/>
							</div>
						</Link>
						<div>NAO V6</div>
					</div>
				</div>
				{messageUpdate ? (
					<>
						<div className="text-2xl mt-12">{messageUpdate}</div>
						<a href="#" className="text-blue-500" onClick={handleDownload}>Télécharger</a>
						{/* <div className="text-xl">Veuillez redémarrer l'application pour installer la mise à jour</div> */}
					</>
				) : (
					<div className="text-2xl mt-12 text-green-700">Vous êtes à jour</div>
				)}
			</div>
		</section>
	);
};

export default Home;
