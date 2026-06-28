// src/tabs/home/grid/EditGridModal.jsx
import React from 'react';
import SystemModal from '@modals/SystemModal';
import Pill from '@ui/Pill';
import PillTray from '@ui/PillTray';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';

/**
 * Widget selection modal.
 *
 * This component is intentionally stateless.
 * Grid.jsx owns the liveLayout draft — each pill click calls onToggle()
 * which updates liveLayout directly. There is no separate "Apply" step
 * inside this modal; the user sees changes live on the grid behind it.
 *
 * Props:
 *   isOpen  — controlled by Grid
 *   onClose — called when user taps "Done" or the backdrop
 *   layout  — Grid's current liveLayout (read-only here)
 *   onToggle(widgetType) — called when a pill is tapped
 */
export default function EditGridModal({ isOpen, onClose, layout = [], onToggle }) {
    return (
        <SystemModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onClose}      
            title="Edit Widgets"
            subtitle="Tap a widget to add or remove it from your workspace."
            confirmText="Done"
        >
            <PillTray layout="brick">
                {Object.keys(WIDGET_DICTIONARY).map((widgetKey) => {
                    const isActive   = layout.some(w => w.type === widgetKey);
                    const widgetName = WIDGET_DICTIONARY[widgetKey]?.name || widgetKey;

                    return (
                        <Pill
                            key={widgetKey}
                            label={widgetName}
                            isActive={isActive}
                            onClick={() => onToggle(widgetKey)}
                        />
                    );
                })}
            </PillTray>
        </SystemModal>
    );
}