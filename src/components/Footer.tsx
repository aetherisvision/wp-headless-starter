export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 px-6 py-8 text-center text-sm text-gray-400">
      <p>© {new Date().getFullYear()} MySite. Built with WordPress + Next.js.</p>
    </footer>
  );
}
