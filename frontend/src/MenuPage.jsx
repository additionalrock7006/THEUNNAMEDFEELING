import { forwardRef } from 'react';
import ProductCard from './ProductCard.jsx';
import './css/MilkTeas.css'

const MenuPageSheet = forwardRef(function MenuPageSheet(
  { title, items = [], onSelectItem },
  ref
) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="menu-page" ref={ref}>
      {title && <h2>{title}</h2>}

      {safeItems.length === 0 ? (
        <p>No items in this category yet.</p>
      ) : (
        <div className="menu-grid">
          {safeItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onOrder={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MenuPageSheet;