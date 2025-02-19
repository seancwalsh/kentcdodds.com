import * as React from 'react'
import type {HeadersFunction, LoaderFunction} from 'remix'
import {json} from 'remix'
import {Outlet} from 'react-router-dom'
import type {KCDHandle, Workshop} from '~/types'
import {getWorkshops} from '~/utils/workshops.server'
import type {Timings} from '~/utils/metrics.server'
import {getServerTimeHeader} from '~/utils/metrics.server'
import type {WorkshopEvent} from '~/utils/workshop-tickets.server'
import {getScheduledEvents} from '~/utils/workshop-tickets.server'
import {reuseUsefulLoaderHeaders} from '~/utils/misc'
import {useMatchLoaderData} from '~/utils/providers'

export const handle: KCDHandle & {id: string} = {
  id: 'workshops',
}

type LoaderData = {
  workshops: Array<Workshop>
  workshopEvents: Array<WorkshopEvent>
  tags: Array<string>
}

export const loader: LoaderFunction = async ({request}) => {
  const timings: Timings = {}
  const workshops = await getWorkshops({request, timings})
  const workshopEvents = await getScheduledEvents()

  const tags = new Set<string>()
  for (const workshop of workshops) {
    for (const category of workshop.categories) {
      tags.add(category)
    }
  }

  const data: LoaderData = {
    workshops,
    workshopEvents,
    tags: Array.from(tags),
  }
  const headers = {
    'Cache-Control': 'public, max-age=3600',
    Vary: 'Cookie',
    'Server-Timing': getServerTimeHeader(timings),
  }
  return json(data, {headers})
}

export const headers: HeadersFunction = reuseUsefulLoaderHeaders

function WorkshopsHome() {
  return <Outlet />
}

export default WorkshopsHome

export const useWorkshopsData = () => useMatchLoaderData<LoaderData>(handle.id)
