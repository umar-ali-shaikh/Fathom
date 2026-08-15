import { RouterProvider } from "react-router";
import { routes } from "./routes";
import { AuthProvider } from "./features/auth/auth.context";
import { PostContextProvider } from "./features/post/post.context";
import "./style.scss";
import "./features/shared/button.scss";
import "./features/shared/style/ui.scss";

const App = () => {
  return (
    <AuthProvider>
      <PostContextProvider>
        <RouterProvider router={routes} />;
      </PostContextProvider>
    </AuthProvider>
  );
};

export default App;
