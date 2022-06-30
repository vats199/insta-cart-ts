import {
  Model,
  AllowNull,
  AutoIncrement,
  Column,
  PrimaryKey,
  Table,
  DataType,
} from "sequelize-typescript";
export interface PaymentI {
  id: number;
  transaction_id: any;
  amount: number;
  status: any;
}

@Table({
  tableName: "payments",
  timestamps: true,
})
export default class payment extends Model implements PaymentI {
  @AutoIncrement
  @PrimaryKey
  @AllowNull(false)
  @Column
  id!: number;

  @Column(DataType.TEXT)
  transaction_id!: any;

  @Column
  amount!: number;

  @Column(DataType.ENUM("PENDING", "SUCCESS", "FAILED"))
  status!: any;
}
