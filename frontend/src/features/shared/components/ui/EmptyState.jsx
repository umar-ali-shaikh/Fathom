const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state">
    {icon && (
      <span className="empty-state-icon" aria-hidden="true">
        {icon}
      </span>
    )}
    <p className="empty-state-title">{title}</p>
    {description && <p className="empty-state-description">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
