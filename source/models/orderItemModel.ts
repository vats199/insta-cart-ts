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
export interface OrderItemI {
  id: number;
  quantity: number;
  itemTotal: number;
}

@Table({
  tableName: "orderitems",
  timestamps: true,
})
export default class orderItem extends Model implements OrderItemI {
  @AutoIncrement
  @PrimaryKey
  @AllowNull(false)
  @Column
  id!: number;

  @Column
  quantity!: number;

  @Column
  itemTotal!: number;
}
