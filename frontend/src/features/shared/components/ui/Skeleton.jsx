const Skeleton = ({ variant = "block", className = "", style }) => (
  <span className={`skeleton skeleton-${variant} ${className}`.trim()} style={style} aria-hidden="true" />
);

export default Skeleton;
