import type { RecordData } from '@/data/records'
import type { Store, TypeModule } from './context'
import { enquiryModule } from '@/workspaces/enquiry'
import { customerModule } from '@/workspaces/customer'
import { bookingModule } from '@/workspaces/booking'
import { workOrderModule } from '@/workspaces/workorder'
import { craneModule } from '@/workspaces/crane'

/** Record types with designed tabs. Everything else renders placeholder content from the config. */
export const typeModules: Record<string, TypeModule> = {
  enquiry: enquiryModule,
  customer: customerModule,
  booking: bookingModule,
  workorder: workOrderModule,
  crane: craneModule,
}

/** The record as it stands after the demo flow. */
export function liveRecord(r: RecordData, s: Store) {
  return typeModules[r.type]?.live?.(r, s) ?? r
}
