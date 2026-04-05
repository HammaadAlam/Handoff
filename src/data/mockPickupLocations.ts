/** Demo campus pickup spots — replace with API + map pins. */
export type PickupSpot = {
  id: string;
  name: string;
  address: string;
  distance: string;
};

export const NEARBY_PICKUP_SPOTS: PickupSpot[] = [
  {
    id: '1',
    name: 'LSU Student Union',
    address: '310 LSU Student Union',
    distance: '0.3 mi',
  },
  {
    id: '2',
    name: 'Barnes & Noble LSU',
    address: '2 Union Square',
    distance: '0.4 mi',
  },
  {
    id: '3',
    name: 'LSU Law Library',
    address: '1 LSU Campus Dr',
    distance: '0.6 mi',
  },
];
