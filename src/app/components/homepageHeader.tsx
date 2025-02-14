export default function HomePageHeader(){
  return (
    <div>
      <header className="bg-dark-bg py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 text-white">
          <div className="text-lg font-bold">Grivax</div>
          <nav>
            <ul className="flex space-x-8">
              <li><a href="#learn">Learn</a></li>
              <li><a href="#opportunities">Opportunities</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#resources">Resources</a></li>
            </ul>
          </nav>
          <div className="space-x-4">
            <button className="bg-transparent text-white px-6 py-2 border border-gray-400 rounded-full hover:bg-primary hover:text-white transition">Search</button>
            <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-red-600 transition">Sign In</button>
          </div>
        </div>
      </header>
    </div>
  );
};
