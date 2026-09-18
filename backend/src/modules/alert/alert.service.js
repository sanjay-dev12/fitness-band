import fetch from 'node-fetch';
import { getConnectionsForUser } from '../family/family.repository.js';
import User from '../user/user.model.js';
import { sendLowHrEmail } from './email.service.js';

export const notifyFamilyLowHr = async (senderUser, heartRate) => {
    // Get all family connections where the sender is part of it
    const connections = await getConnectionsForUser(senderUser.id);
    
    const targetUserIds = [];
    connections.forEach(conn => {
        if (conn.status !== 'accepted') return;
        // Directional Access Rule: Only the 'childId' is authorized to monitor the 'parentId'.
        // So if the sender is the parentId, we notify the childId.
        if (conn.parentId === senderUser.id && conn.childId) {
            targetUserIds.push(conn.childId);
        }
    });

    if (targetUserIds.length === 0) {
        return { message: 'No eligible connected family members found.' };
    }

    // Fetch those users to get their push tokens
    const targetUsers = await User.findAll({
        where: { id: targetUserIds }
    });

    const usersWithTokens = targetUsers.filter(u => u.pushToken);

    let pushSentCount = 0;
    let pushResult = null;

    if (usersWithTokens.length > 0) {
        const messages = usersWithTokens.map(user => ({
            to: user.pushToken,
            sound: 'default',
            title: 'Low Heart Rate Alert',
            body: `Low heart rate detected for ${senderUser.fullName}. Current heart rate: ${heartRate} BPM. Please check on them.`,
            data: { heartRate, senderId: senderUser.id },
        }));

        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });
            
            pushResult = await response.json();
            console.log('Push notification response:', pushResult);
            pushSentCount = usersWithTokens.length;
        } catch (error) {
            console.error('Failed to send push notifications:', error);
            // We don't throw here so emails can still try to send
        }
    }

    // Also send automatic emails to those with valid email addresses
    let emailCount = 0;
    for (const user of targetUsers) {
        // Check if the identifier looks like an email address
        if (user.identifier && user.identifier.includes('@')) {
            await sendLowHrEmail(user.identifier, senderUser, heartRate);
            emailCount++;
        } else if (user.email) {
            await sendLowHrEmail(user.email, senderUser, heartRate);
            emailCount++;
        }
    }
    
    return { 
        message: 'Alerts processed successfully.', 
        pushSentCount: pushSentCount,
        emailSentCount: emailCount,
        pushResult
    };
};
