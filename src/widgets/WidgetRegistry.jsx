import { GoalTestWidget, FocusTestWidget, HabitsTestWidget, StatsTestWidget } from './TestWidgets';

export const WIDGET_DICTIONARY = {
    'goal-countdown': { 
        component: GoalTestWidget, 
        // Speak native RGL: Width and Height integers
        allowedSizes: [ {w: 2, h: 1}, {w: 4, h: 1} ] 
    },
    'focus-clock': { 
        component: FocusTestWidget, 
        allowedSizes: [ {w: 2, h: 1}, {w: 3, h: 1}, {w: 2, h: 2} ] 
    },
    'daily-habits': { 
        component: HabitsTestWidget, 
        allowedSizes: [ {w: 2, h: 1}, {w: 3, h: 1}, {w: 2, h: 2}, {w: 2, h: 2} ] 
    },
    'weekly-stats': { 
        component: StatsTestWidget, 
        allowedSizes: [ {w: 2, h: 1}, {w: 3, h: 1}, {w: 2, h: 1}, {w: 4, h: 2} ] 
    }
};