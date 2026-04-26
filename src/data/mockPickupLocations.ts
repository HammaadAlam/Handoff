/** Demo campus pickup spots — replace with API + map pins. */
export type PickupSpot = {
  id: string;
  name: string;
  address: string;
  distance: string;
};

export const NEARBY_PICKUP_SPOTS: PickupSpot[] = [
  {
    id: 'student-union',
    name: 'LSU Student Union',
    address: 'LSU Student Union, Baton Rouge, LA 70803',
    distance: '0.3 mi',
  },
  {
    id: 'police-safety',
    name: 'LSU Police / Public Safety Building',
    address: '204 South Stadium Road, Baton Rouge, LA 70803',
    distance: '0.4 mi',
  },
  {
    id: 'barnes-noble',
    name: 'LSU Barnes & Noble Bookstore',
    address: '2 Union Square, Baton Rouge, LA 70803',
    distance: '0.6 mi',
  },
];
