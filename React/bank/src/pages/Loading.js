import React from 'react';

const Loading = () => {
	return (
	  <div className="mt-10 flex-col flex items-center">
		<h1>404 - Page Not Found</h1>
		<p>The page you're looking for doesn't exist or you don't have access to it.</p>
		<a className="border border-black max-w-md" href="/">Return to Home</a>
	  </div>
	);
}
export default Loading;
