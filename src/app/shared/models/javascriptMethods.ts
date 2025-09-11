import clone from 'clone';
import { TreeNode } from 'primeng/api';

export class GlobalMethods {
  static isProduction = false;
  static roleAdmin='Admin';
  static rowsPerPageOptions=[10, 25, 50, 100, 500, 1000,3000,5000,7000,10000];
  static pageSize=10;
  static pageNumber=1;

  static ApiUrl() {
    return GlobalMethods.isProduction ? 'http://localhost:9090/api/' : 'http://localhost:5020/api/';
  }

  static FileUrl() {
    return GlobalMethods.isProduction ? 'http://localhost:9090/uploads/' : 'http://localhost:5020/uploads/';
  }

  static ApiHost() {
    return GlobalMethods.isProduction ? 'http://localhost:9090/' : 'http://localhost:5020/';
  }

  static deepClone<T>(value: T): T {
    return clone<T>(value);
  }

  static jsonDeepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static findTreeNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findTreeNodeByKey(node.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  static getDistinctBy<T>(data: T[], property: keyof T): T[] {
    try {
      const seen = new Set<any>();
      const result: T[] = [];

      for (const item of data) {
        const value = item[property];
        if (value != null && !seen.has(value)) {
          seen.add(value);
          result.push(item);
        }
      }

      return result;
    } catch (error) {
      return error as any;
    }
  }

  static closeDropdown(closeBtn) {
    try {
      closeBtn.nativeElement.click();
    } catch (error) {
      return error as any;
    }
  }

  static reportRenderingType = {
    'Excel': 'Excel',
    'PDF': 'PDF',
    'word': 'word',
    'Image':'Image'
  };

  static fileFolders = {
    'demo': "demo",
  }

  
}

export const EntityState = {
  /**
   * The entity is not being tracked by the context.
   */
  Detached: 0,

  /**
   * The entity is being tracked by the context and exists in the database.
   * Its property values have not changed from the values in the database.
   */
  Unchanged: 1,

  /**
   * The entity is being tracked by the context and exists in the database.
   * It has been marked for deletion from the database.
   */
  Deleted: 2,

  /**
   * The entity is being tracked by the context and exists in the database.
   * Some or all of its property values have been modified.
   */
  Modified: 3,

  /**
   * The entity is being tracked by the context but does not yet exist in the database.
   */
  Added: 4,
};

