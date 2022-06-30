import {
  Model,
  AllowNull,
  AutoIncrement,
  Column,
  PrimaryKey,
  Table,
  DataType,
  Default,
} from "sequelize-typescript";
export interface OrderI {
  id: number;
  status: any;
  order_type: any;
  delivery_time: any;
  amount: number;
  discount_amount: number;
  country_code: string;
  phone_number: string;
  instructions: string;
  net_amount: number;
  is_gift: boolean;
}

@Table({
  tableName: "orders",
  timestamps: true,
})
export default class order extends Model implements OrderI {
  @AutoIncrement
  @PrimaryKey
  @AllowNull(false)
  @Column
  id!: number;

  @Column(DataType.TINYINT)
  status!: any;

  @Column(DataType.ENUM("Delivery", "PickUp"))
  order_type!: any;

  @Column(DataType.DATE)
  delivery_time!: any;

  @Column
  amount!: number;

  @Column
  discount_amount!: number;

  @Column
  country_code!: string;

  @Column
  phone_number!: string;

  @Column
  instructions!: string;

  @Column
  net_amount!: number;

  @Default(false)
  @Column
  is_gift!: boolean;
}
