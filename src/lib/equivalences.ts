export interface Equivalence {
  threshold: number;
  item: string;
  emoji: string;
}

export const equivalences: Equivalence[] = [
  { threshold: 5, item: "A Fancy Coffee", emoji: "☕" },
  { threshold: 15, item: "Netflix Subscription", emoji: "📺" },
  { threshold: 30, item: "Team Lunch", emoji: "🍕" },
  { threshold: 75, item: "Software License", emoji: "💻" },
  { threshold: 150, item: "Fancy Dinner for Two", emoji: "🍽️" },
  { threshold: 300, item: "Roundtrip Flight", emoji: "✈️" },
  { threshold: 500, item: "New MacBook Charger", emoji: "🔌" },
  { threshold: 800, item: "High-end Office Chair", emoji: "🪑" },
  { threshold: 1000, item: "iPhone 15 Pro", emoji: "📱" },
  { threshold: 2000, item: "Company Retreat Day", emoji: "🏖️" },
  { threshold: 3500, item: "Full Home Office Setup", emoji: "🖥️" },
  { threshold: 5000, item: "Used 2018 Honda Civic", emoji: "🚗" },
  { threshold: 8000, item: "Luxury Vacation", emoji: "🌴" },
  { threshold: 12000, item: "Entry-Level Salary (1 Month)", emoji: "💰" },
  { threshold: 20000, item: "Small Business Loan Payment", emoji: "🏦" },
  { threshold: 50000, item: "Junior Developer (1 Year)", emoji: "👨‍💻" },
];

export function getEquivalence(cost: number): Equivalence | null {
  // Find the highest threshold that has been crossed
  let result: Equivalence | null = null;
  
  for (const eq of equivalences) {
    if (cost >= eq.threshold) {
      result = eq;
    } else {
      break;
    }
  }
  
  return result;
}

export function getNextEquivalence(cost: number): Equivalence | null {
  for (const eq of equivalences) {
    if (cost < eq.threshold) {
      return eq;
    }
  }
  return null;
}

export function formatCurrency(amount: number, currency: 'USD' | 'EUR'): string {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'USD' ? `$${formattedAmount}` : `${formattedAmount}€`;
}

export function formatCurrencyShort(amount: number, currency: 'USD' | 'EUR'): string {
  if (amount >= 1000) {
    const formatted = `${(amount / 1000).toFixed(1)}k`;
    return currency === 'USD' ? `$${formatted}` : `${formatted}€`;
  }
  const formatted = amount.toFixed(0);
  return currency === 'USD' ? `$${formatted}` : `${formatted}€`;
}
