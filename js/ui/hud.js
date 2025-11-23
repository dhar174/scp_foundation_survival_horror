// HUD management
class HUD {
    constructor() {
        this.healthFill = document.getElementById('health-fill');
        this.staminaFill = document.getElementById('stamina-fill');
        this.keycardLevel = document.getElementById('keycard-level');
        this.objectiveText = document.getElementById('objective-text');
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.interactionAction = document.getElementById('interaction-action');
    }
    
    updateHealth(current, max) {
        const percentage = (current / max) * 100;
        this.healthFill.style.width = percentage + '%';
    }
    
    updateStamina(current, max) {
        const percentage = (current / max) * 100;
        this.staminaFill.style.width = percentage + '%';
    }
    
    updateKeycard(level) {
        const keycardNames = [
            'NONE',
            'LEVEL 1',
            'LEVEL 2',
            'LEVEL 3',
            'LEVEL 4',
            'LEVEL 5',
            'OMNI'
        ];
        this.keycardLevel.textContent = keycardNames[level] || 'NONE';
    }
    
    updateObjective(text) {
        this.objectiveText.textContent = text;
    }
    
    showInteraction(action) {
        this.interactionAction.textContent = action;
        this.interactionPrompt.classList.remove('hidden');
    }
    
    hideInteraction() {
        this.interactionPrompt.classList.add('hidden');
    }
    
    update(player, world) {
        // Update stats
        this.updateHealth(player.health, player.maxHealth);
        this.updateStamina(player.stamina, player.maxStamina);
        this.updateKeycard(player.keycardLevel);
        
        // Check for nearby interactables (prioritize closest)
        const nearbyObjects = world.getObjectsInRange(player.position, 2.0);
        let closestInteractable = null;
        let closestDistance = Infinity;
        
        nearbyObjects.forEach(obj => {
            if (obj.type === 'keycard' || obj.type === 'door') {
                const dist = MathUtils.vec3.distance(player.position, obj.position);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestInteractable = obj;
                }
            }
        });
        
        if (closestInteractable) {
            if (closestInteractable.type === 'keycard') {
                this.showInteraction('pick up keycard');
            } else if (closestInteractable.type === 'door') {
                if (closestInteractable.keycardRequired <= player.keycardLevel) {
                    this.showInteraction('open door');
                } else {
                    this.showInteraction(`locked (Level ${closestInteractable.keycardRequired} required)`);
                }
            }
        } else {
            this.hideInteraction();
        }
    }
}
