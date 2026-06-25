// src/tabs/home/grid/EditGridModal.jsx
import React, { useState, useEffect } from 'react';
import SystemModal from '@modals/SystemModal';
import Pill from '@ui/Pill'; 
import PillTray from '@ui/PillTray'; // THE NEW TRAY
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';

export default function EditGridModal({ isOpen, onClose, userLayout, onSave }) {
    const [draftLayout, setDraftLayout] = useState([]);

    useEffect(() => {
        if (isOpen) setDraftLayout(userLayout);
    }, [isOpen, userLayout]);

    const handleToggle = (widgetType) => {
        const exists = draftLayout.find(w => w.type === widgetType);
        if (exists) {
            setDraftLayout(draftLayout.filter(w => w.type !== widgetType));
        } else {
            const config = WIDGET_DICTIONARY[widgetType];
            const isDesktop = window.innerWidth >= 768; 
            const opt = {
                w: isDesktop ? (config?.oDW || 2) : (config?.oMW || 2),
                h: isDesktop ? (config?.oDH || 2) : (config?.oMH || 2)
            };
            setDraftLayout([...draftLayout, { id: `widget-${Date.now()}`, type: widgetType, x: 0, y: 0, w: opt.w, h: opt.h }]);
        }
    };

    return (
        <SystemModal 
            isOpen={isOpen} 
            onClose={onClose} 
            onConfirm={() => { onSave(draftLayout); onClose(); }}
            title="Edit Widgets" 
            subtitle="Select the widgets you want on your dashboard."
            confirmText="Save"
        >
            {/* BOOM. One line for perfect layout. */}
            <PillTray layout="brick">
                {Object.keys(WIDGET_DICTIONARY).map((widgetKey) => {
                    const isActive = draftLayout.some(w => w.type === widgetKey);
                    const widgetName = WIDGET_DICTIONARY[widgetKey]?.name || widgetKey.replace('-', ' ');
                    
                    return (
                        <Pill
                            key={widgetKey}
                            label={widgetName}
                            isActive={isActive}
                            onClick={() => handleToggle(widgetKey)}
                        />
                    );
                })}
            </PillTray>
        </SystemModal>
    );
}