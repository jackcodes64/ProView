export default function Header({ activeTab }) {
  return (
    <header className="header">
      <div className="page-title">
        <h1>{activeTab}</h1>
      </div>
    </header>
  );
}
