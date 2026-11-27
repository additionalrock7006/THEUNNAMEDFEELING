import { useState } from "react";
import { useCart } from "./AddToCartSystem.jsx";
import "./css/Modal.css";

function calculateUnitPrice(basePrice, groups, selections) {
  let unitTotal = Number(basePrice) || 0;

  for (const group of groups) {
    const chosenLabel = selections[group.key];
    const matchedOption = group.options?.find((opt) => opt.label === chosenLabel);
    if (matchedOption) {
      unitTotal += Number(matchedOption.priceDelta ?? matchedOption.priceChange) || 0;
    }
  }
  return unitTotal;
}

function OrderingScreen({ item, onClose }) {
  const { addToCart } = useCart();

  const groups = Array.isArray(item?.optionGroups) ? item.optionGroups : [];

  const [selections, setSelections] = useState(() =>
    Object.fromEntries(
      groups.map((group) => {
        const fallbackLabel = group.options?.[0]?.label ?? "";
        return [group.key, group.defaultValue ?? fallbackLabel];
      })
    )
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const unitPrice = calculateUnitPrice(item.basePrice, groups, selections);
  const totalPrice = unitPrice * quantity;

  function handleSelect(groupKey, value) {
    setSelections((prev) => ({ ...prev, [groupKey]: value }));
  }

  function handleAddToCart(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    addToCart({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      selections,
      unitPrice,
      quantity,
      totalPrice,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    setStatusMessage("Added to cart!");
    if (onClose) {
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-item-title"
    >
      <div className="modal-box">
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        )}

        <h2 id="modal-item-title">{item.name}</h2>
        <h3>Price: ₱{totalPrice}</h3>

        <fieldset className="quantity">
          <legend>Quantity</legend>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              setQuantity(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
            }}
          />

          <button type="button" onClick={() => setQuantity((q) => q + 1)}>
            +
          </button>
        </fieldset>

        <form onSubmit={handleAddToCart}>
          {groups.map((group) => (
            <fieldset key={group.key}>
              <legend>{group.label}</legend>
              {(group.options || []).map((option) => {
                const delta = Number(option.priceDelta ?? option.priceChange) || 0;
                return (
                  <label key={option.label}>
                    <input
                      type="radio"
                      name={group.key}
                      value={option.label}
                      checked={selections[group.key] === option.label}
                      onChange={(e) => handleSelect(group.key, e.target.value)}
                    />
                    {option.label}
                    {delta > 0 ? ` (+₱${delta})` : ""}
                  </label>
                );
              })}
            </fieldset>
          ))}

          <fieldset>
            <legend>Notes:</legend>
            <input
              type="text"
              placeholder="Extra napkins..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </fieldset>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : `Add to Cart — ₱${totalPrice}`}
          </button>

          {statusMessage && <p>{statusMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default OrderingScreen;