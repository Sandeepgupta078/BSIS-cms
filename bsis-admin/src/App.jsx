import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PagesList from "./pages/PagesList";
import PageEditor from "./pages/PageEditor";
import MediaLibrary from "./pages/MediaLibrary";
import EventsList from "./pages/EventsList";
import EventForm from "./pages/EventForm";
import NewsList from "./pages/NewsList";
import NewsForm from "./pages/NewsForm";
import Team from "./pages/Team";
import Partners from "./pages/Partners";
import Inbox from "./pages/Inbox";
import Users from "./pages/Users";
import Members from "./pages/Members";
import Account from "./pages/Account";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/new" element={<PageEditor />} />
        <Route path="pages/:id" element={<PageEditor />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id" element={<EventForm />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/:id" element={<NewsForm />} />
        <Route path="team" element={<Team />} />
        <Route path="partners" element={<Partners />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="members" element={<Members />} />
        <Route path="users" element={<Users />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
