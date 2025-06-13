import SearchForm from '../components/SearchForm';
import { allAirports } from '../lib/data';

export default function Home() {
    return (
        <main>
            <h1>Route Planner</h1>
            <SearchForm airports={allAirports} />
        </main>
    );
}
