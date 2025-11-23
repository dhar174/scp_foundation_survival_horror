// Inventory system
class InventorySystem {
    constructor() {
        this.items = [];
        this.maxSlots = 10;
        this.selectedSlot = 0;
    }
    
    addItem(item) {
        if (this.items.length < this.maxSlots) {
            this.items.push(item);
            return true;
        }
        return false;
    }
    
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
        }
    }
    
    getItem(index) {
        return this.items[index] || null;
    }
    
    selectSlot(index) {
        if (index >= 0 && index < this.maxSlots) {
            this.selectedSlot = index;
        }
    }
    
    getSelectedItem() {
        return this.items[this.selectedSlot] || null;
    }
}

// Item types
const ItemTypes = {
    KEYCARD_L1: { name: 'Level 1 Keycard', type: 'keycard', level: 1 },
    KEYCARD_L2: { name: 'Level 2 Keycard', type: 'keycard', level: 2 },
    KEYCARD_L3: { name: 'Level 3 Keycard', type: 'keycard', level: 3 },
    KEYCARD_L4: { name: 'Level 4 Keycard', type: 'keycard', level: 4 },
    KEYCARD_L5: { name: 'Level 5 Keycard', type: 'keycard', level: 5 },
    KEYCARD_OMNI: { name: 'Omni Keycard', type: 'keycard', level: 6 },
    MEDKIT: { name: 'Medical Kit', type: 'consumable', healAmount: 50 },
    BATTERY: { name: 'Battery', type: 'consumable', staminaAmount: 50 }
};
