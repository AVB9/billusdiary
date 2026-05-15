import { GoalTestWidget, FocusTestWidget, HabitsTestWidget, StatsTestWidget } from './TestWidgets';

export const WIDGET_DICTIONARY = {
    'goal-countdown': { 
        component: GoalTestWidget, 
        // Mobile spans full screen (12). Desktop spans half screen (6).
        oDW: 6, oDH: 1, 
        oMW: 12, oMH: 1  
    },
    'focus-clock': { 
        component: FocusTestWidget, 
        // A nice square layout (1/3rd of the screen on desktop)
        oDW: 4, oDH: 2, 
        oMW: 12, oMH: 2 
    },
    'daily-habits': { 
        component: HabitsTestWidget, 
        // Half screen width, taller layout
        oDW: 6, oDH: 3, 
        oMW: 12, oMH: 2 
    },
    'weekly-stats': { 
        component: StatsTestWidget, 
        // Full width banner on desktop and mobile!
        oDW: 12, oDH: 1, 
        oMW: 12, oMH: 2 
    }
};