import { Link } from 'react-router-dom';

const Raspberry = () => {
	return (
		<section>
			<Link to="/">
				<button className="mb-8">Home</button>
			</Link>

			<div className="mb-8">Raspberry</div>
			<p>Bientôt disponible !!! </p>
		</section>
	);
};

export default Raspberry;
