import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin, map } from 'rxjs';
import { UserService } from './core/user/user.service';

export const initialDataResolver = () =>
{
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const shortcutsService = inject(ShortcutsService);
    const userService = inject(UserService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
        messagesService.getAll(),
        navigationService.get(),
        notificationsService.getAll(),
        shortcutsService.getAll(),
        userService.get()
    ]).pipe(
        map(([messages, navigation, notifications, shortcuts, user]) => ({
                messages,
                navigation: {
                    compact   : navigation.compact,
                    default   : navigation.default,
                    futuristic: navigation.futuristic,
                    horizontal: navigation.horizontal
                },
                notifications,
                shortcuts,
                user
            })
        )
    );
};
