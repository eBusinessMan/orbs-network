export interface ManagementService {
  isAlive(): boolean;
}

export class AlwaysAliveManagementService implements ManagementService {
  isAlive(): boolean {
    return true;
  }
}

// this is a rough sketch
class HealthCheckingManagementService {
  startupChecks: Function[];
  periodicChecks: Function[];
}
