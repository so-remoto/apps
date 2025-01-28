const loginForm = document.getElementById('login-form-action')
const registerForm = document.getElementById('register-form-action')

function showLoginScreen() {
  document.getElementById('login-form').style.display = 'flex'
  document.getElementById('register-form').style.display = 'none'
}

function showRegisterScreen() {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('register-form').style.display = 'flex'
}

document.getElementById('show-register').addEventListener('click', function () {
  showRegisterScreen()
})

document.getElementById('show-login').addEventListener('click', function () {
  showLoginScreen()
})

showLoginScreen()

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  email = e.target.email.value
  senha = e.target.name.value

  const userData = { email, senha }

  try {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (response.ok) {
      const result = await response.json()
      alert('Usuário cadastrado com sucesso!')
      return
    }
    alert('Erro ao cadastrar usuário!')
    console.error('Erro:', response.status, response.statusText)
  } catch (error) {
    alert('Erro na comunicação com o servidor!')
    console.error('Erro:', error)
  }
})

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  nomeCompleto = e.target.name.value
  email = e.target.email.value
  senha = e.target.senha.value

  const userData = { nomeCompleto, email, senha }

  try {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (response.ok) {
      const result = await response.json()
      alert('Usuário cadastrado com sucesso!')
      return
    }

    alert('Erro ao cadastrar usuário!')
    console.error('Erro:', response.status, response.statusText)
  } catch (error) {
    alert('Erro na comunicação com o servidor!')
    console.error('Erro:', error)
  }
})

// Só testando o fetch dos Perfis
const fetchPerfis = async () => {
  const response = await fetch('http://localhost:3001/api/profiles')
  const result = await response.json()
  console.log(result)
}

fetchPerfis()
