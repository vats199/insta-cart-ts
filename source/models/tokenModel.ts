import {
  Model,
  AllowNull,
  AutoIncrement,
  Column,
  PrimaryKey,
  Table,
  DataType,
} from "sequelize-typescript";
export interface TokenI {
  id: number;
  accessToken: any;
  refreshToken: any;
  login_count: number;
}

@Table({
  tableName: "tokens",
  timestamps: true,
})
export default class Token extends Model implements TokenI {
  @AutoIncrement
  @PrimaryKey
  @AllowNull(false)
  @Column
  id!: number;

  @Column(DataType.TEXT)
  accessToken!: any;

  @Column(DataType.TEXT)
  refreshToken!: any;

  @Column
  login_count!: number;
}
