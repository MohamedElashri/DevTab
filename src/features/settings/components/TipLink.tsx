export const TipLink = ({ quiet = false }: { quiet?: boolean }) => (
  <a
    className="settingsTip"
    data-quiet={quiet}
    href="https://ko-fi.com/melashri"
    target="_blank"
    rel="noopener noreferrer">
    <span aria-hidden="true">♥</span> Leave a tip on Ko-fi
  </a>
)
