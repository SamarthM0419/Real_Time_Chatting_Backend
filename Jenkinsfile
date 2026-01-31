pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Services') {
            parallel {
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        dir('authservice') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Profile Service') {
                    steps {
                        dir('profileservice') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
    }
}