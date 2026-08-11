import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
export function TeamScreen() {
  return (
    <Screen>
      <EmptyState
        title={"Build your team"}
        body={"Four to five riders with a role per event. Once an alternate replaces someone, that rider is out for the rest of the rodeo — the roster enforces it."}
        actionLabel={"Add a rider"}
      />
    </Screen>
  );
}
