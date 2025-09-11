// shared/models/user.model.ts

export interface UserRole {
  userName: string;
  empId: number;
  empName: string;
  roleName: string;
  userRoleMapId: number;
  userId: number;
  roleId: number;
  isActive: boolean;
  isEnabled: boolean;
  isSelected: boolean;
  tag: number;
  codeGenPropertyVal: string;
  responseCode: number;
  responseMessage: string;
  responseSuccess: boolean;
  id: number;
}

export interface User {
  payRoleName: string;
  roleList: UserRole[];
  id: number;           // seems like same as userId, but keep both for safety
  userName: string;
  password: string;
  typeName: string;
  userId: number;
  roleId: number;
  rfId: number;
  updateCardBy: string;
  updateCardDate: string; // you can convert to Date in code if needed
}
