export default function Home() {
  return (
    <main>
      <h1>Nuchu Nav API</h1>
      <p>
        This Webflow Cloud app exposes <code>/api/nav</code> for navbar links. Configure environment
        variables and deploy with the Webflow CLI.
      </p>
      <ul>
        <li>
          <a href="/api/nav">GET /api/nav</a> — list links
        </li>
      </ul>
    </main>
  );
}
