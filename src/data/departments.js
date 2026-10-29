export const departments = [
  {
    id: "general-medicine",
    name: "General Medicine",
    totalBeds: 120,
    occupiedBeds: 84,
    availableBeds: 36,
    bedTypes: [
      { type: "General Ward", total: 80, occupied: 60 },
      { type: "Isolation Bed", total: 20, occupied: 12 },
      { type: "Emergency Bed", total: 20, occupied: 12 },
    ],
  },
  {
    id: "icu",
    name: "ICU",
    totalBeds: 40,
    occupiedBeds: 31,
    availableBeds: 9,
    bedTypes: [
      { type: "ICU Bed", total: 25, occupied: 20 },
      { type: "Ventilator Bed", total: 10, occupied: 8 },
      { type: "Critical Care Bed", total: 5, occupied: 3 },
    ],
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    totalBeds: 60,
    occupiedBeds: 38,
    availableBeds: 22,
    bedTypes: [
      { type: "Pediatric General", total: 35, occupied: 20 },
      { type: "NICU", total: 15, occupied: 11 },
      { type: "PICU", total: 10, occupied: 7 },
    ],
  },
  {
    id: "cardiology",
    name: "Cardiology",
    totalBeds: 50,
    occupiedBeds: 42,
    availableBeds: 8,
    bedTypes: [
      { type: "CCU", total: 20, occupied: 18 },
      { type: "Cardiac Ward", total: 20, occupied: 16 },
      { type: "Post Operation Bed", total: 10, occupied: 8 },
    ],
  },
];