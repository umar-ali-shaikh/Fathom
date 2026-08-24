import { NavLink } from "react-router";

const TabBar = ({ items }) => (
  <nav className="tab-bar" aria-label="Primary">
    {items.map(({ to, label, renderIcon, end, variant }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `tab-bar-item${isActive ? " active" : ""}${variant ? ` tab-bar-item--${variant}` : ""}`
        }
        aria-label={label}
      >
        {({ isActive }) => renderIcon(isActive)}
      </NavLink>
    ))}
  </nav>
);

export default TabBar;
