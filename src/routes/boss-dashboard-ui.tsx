import { Hono } from 'hono'
import bossDashboard from '../pages/BossDashboard'

const bossDashboardUIRoutes = new Hono()

// L4 Boss Dashboard route
bossDashboardUIRoutes.route('/boss', bossDashboard)

export default bossDashboardUIRoutes
