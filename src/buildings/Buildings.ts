import { createCHEM } from './CHEM'
import { createHFH } from './HFH'
import { createKvali } from './Kvali'
import { createMRL } from './MRL'

export function createBuildings() {
  return [createMRL(), createKvali(), createHFH(), createCHEM()]
}
