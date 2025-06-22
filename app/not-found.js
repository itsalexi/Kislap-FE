import ErrorPage, { ErrorTypes } from './components/ErrorPage';

export default function NotFound() {
    return <ErrorPage type={ErrorTypes.NOT_FOUND} />;
}
