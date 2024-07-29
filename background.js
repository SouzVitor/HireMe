// Inicializa o armazenamento quando a extensão é instalada
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ applications: [] });
  });
  
  // Listener para alarmes
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('jobReminder')) {
      const [, jobTitle, company] = alarm.name.split('|');
  
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Lembrete da candidatura a emprego',
        message: `Lembre-se de acompanhar sua candidatura para ${jobTitle} na ${company}.`,
        priority: 2
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Erro ao criar a notificação:', chrome.runtime.lastError.message);
        }
      });
    }
  });
  