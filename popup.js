document.addEventListener('DOMContentLoaded', function () {
    const applicationForm = document.getElementById('applicationForm');
    const applicationsDiv = document.getElementById('applications');
    const generateReportBtn = document.getElementById('generateReport');
    const reportDiv = document.getElementById('report');
  
    // Ajustar a largura da janela da extensão
    const desiredWidth = 500; // Largura desejada em pixels
    chrome.windows.getCurrent(function (window) {
      chrome.windows.update(window.id, { width: desiredWidth });
    });
  
    // Carregar aplicações salvas
    displayApplications();
  
    // Adicionar nova aplicação
    applicationForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const jobTitle = document.getElementById('jobTitle').value;
      const company = document.getElementById('company').value;
      const deadline = document.getElementById('deadline').value;
      const notes = document.getElementById('notes').value;
  
      addApplication({ jobTitle, company, deadline, notes, status: 'Applied' });
      applicationForm.reset();
    });
  
    // Gerar relatório
    generateReportBtn.addEventListener('click', generateReport);
  
    // Função para adicionar uma aplicação
    function addApplication(application) {
      chrome.storage.sync.get('applications', function (data) {
        const applications = data.applications || [];
        applications.push(application);
        chrome.storage.sync.set({ applications }, function () {
          displayApplications();
          scheduleReminder(application.jobTitle, application.company, application.deadline);
        });
      });
    }
  
    // Função para exibir as aplicações salvas
    function displayApplications() {
      chrome.storage.sync.get('applications', function (data) {
        const applications = data.applications || [];
        applicationsDiv.innerHTML = ''; // Limpa a lista de aplicações antes de exibir
        applications.forEach((app, index) => {
          const appDiv = document.createElement('div');
          appDiv.className = 'application';
          appDiv.innerHTML = `
            <h3>${app.jobTitle}</h3>
            <p>Empresa: ${app.company}</p>
            <p>Deadline: ${app.deadline}</p>
            <p>Notes: ${app.notes}</p>
            <p>Status: ${app.status}</p>
            <button class="update-status" data-index="${index}" data-status="Entrevista">Marcar como Entrevista</button>
            <button class="update-status" data-index="${index}" data-status="Rejeitado">Marcar como Rejeitado</button>
            <button class="update-status" data-index="${index}" data-status="Aceito">Marcar como Aceito</button>
            <button class="delete-application" data-index="${index}">Excluir Aplicação</button>
          `;
          applicationsDiv.appendChild(appDiv);
        });
  
        // Adicionar eventos aos botões de atualização de status
        document.querySelectorAll('.update-status').forEach(button => {
          button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            const status = this.getAttribute('data-status');
            updateStatus(index, status);
          });
        });
  
        // Adicionar eventos aos botões de exclusão de aplicação
        document.querySelectorAll('.delete-application').forEach(button => {
          button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            deleteApplication(index);
          });
        });
      });
    }
  
    // Função para atualizar o status de uma aplicação
    function updateStatus(index, status) {
      chrome.storage.sync.get('applications', function (data) {
        const applications = data.applications || [];
        applications[index].status = status;
        chrome.storage.sync.set({ applications });
        displayApplications(); // Atualiza a lista de aplicações após a mudança
      });
    }
  
    // Função para excluir uma aplicação
    function deleteApplication(index) {
      chrome.storage.sync.get('applications', function (data) {
        const applications = data.applications || [];
        applications.splice(index, 1); // Remove a aplicação do array
        chrome.storage.sync.set({ applications });
        displayApplications(); // Atualiza a lista de aplicações após a exclusão
      });
    }
  
    // Função para agendar um lembrete
    function scheduleReminder(jobTitle, company, deadline) {
      const reminderTime = new Date(deadline).getTime() - (24 * 60 * 60 * 1000); // 1 dia antes do prazo
      const alarmName = `jobReminder|${jobTitle}|${company}`;
  
      chrome.alarms.create(alarmName, { when: reminderTime });
    }
  
    // Função para gerar um relatório
    function generateReport() {
      chrome.storage.sync.get('applications', function (data) {
        const applications = data.applications || [];
        const total = applications.length;
        const applied = applications.filter(app => app.status === 'Applied').length;
        const interview = applications.filter(app => app.status === 'Interview').length;
        const rejected = applications.filter(app => app.status === 'Rejected').length;
        const accepted = applications.filter(app => app.status === 'Accepted').length;
  
        reportDiv.innerHTML = `
          <h2>Report</h2>
          <p>Total Applications: ${total}</p>
          <p>Applied: ${applied}</p>
          <p>Interview: ${interview}</p>
          <p>Rejected: ${rejected}</p>
          <p>Accepted: ${accepted}</p>
        `;
      });
    }
  });
  