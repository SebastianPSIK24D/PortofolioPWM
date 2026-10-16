const EmptyState = ({ title, text, children }) => (
  <div className="empty-state">
    <h4>{title}</h4>
    <p>{text}</p>
    {children}
  </div>
);

export default EmptyState;