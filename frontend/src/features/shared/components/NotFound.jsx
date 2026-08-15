import { Link } from "react-router";

const NotFound = () => {
  return (
    <main className="route-loading">
      <div>
        <h1>404</h1>
        <p>This page doesn't exist.</p>
        <Link to="/">Go back home</Link>
      </div>
    </main>
  );
};

export default NotFound;
