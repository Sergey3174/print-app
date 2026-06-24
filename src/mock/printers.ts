export type Printer = {
  pid: string;
  name: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  is_busy: boolean;
  price_bw: number;
  price_color: number;
  price_bw_duplex: number;
  price_color_duplex: number;
};

export type PrintersMock = {
  cid: string;
  printers: Printer[];
};

export const printersMock: PrintersMock = {
  cid: "test",
  printers: [
    {
      pid: "JKT-CENTRAL-01",
      name: "Central Jakarta Print Hub",
      latitude: -6.1751,
      longitude: 106.865,
      is_online: true,
      is_busy: false,
      price_bw: 10,
      price_color: 20,
      price_bw_duplex: 8,
      price_color_duplex: 16,
    },

    {
      pid: "JKT-OLDTOWN-03",
      name: "Old Town Copy Center",
      latitude: -6.137,
      longitude: 106.814,
      is_online: true,
      is_busy: false,
      price_bw: 9,
      price_color: 19,
      price_bw_duplex: 7,
      price_color_duplex: 15,
    },
    {
      pid: "JKT-WEST-04",
      name: "West Jakarta Print Spot",
      latitude: -6.302,
      longitude: 106.652,
      is_online: true,
      is_busy: false,
      price_bw: 11,
      price_color: 21,
      price_bw_duplex: 9,
      price_color_duplex: 17,
    },
    {
      pid: "JKT-NORTH-05",
      name: "North Jakarta Station Printer",
      latitude: -6.118,
      longitude: 106.91,
      is_online: true,
      is_busy: true,
      price_bw: 13,
      price_color: 24,
      price_bw_duplex: 11,
      price_color_duplex: 20,
    },
    {
      pid: "JKT-SOUTH-02",
      name: "South Jakarta Office Printer",
      latitude: -6.224,
      longitude: 106.809,
      is_online: false,
      is_busy: true,
      price_bw: 12,
      price_color: 22,
      price_bw_duplex: 10,
      price_color_duplex: 18,
    },
  ],
};
