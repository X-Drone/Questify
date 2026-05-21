"""
Container для инициализации всех компонентов приложения (DI контейнер).
Централизованное место для создания экземпляров всех сервисов с их зависимостями.
"""

from typing import Callable, Protocol
from domain.services import AnalysisService, ProjectService as ProjectDomainService
from app.use_cases import (
    CreateProjectUseCase,
    StartAnalysisUseCase,
    GetUserProjectsUseCase,
    DeleteProjectUseCase,
    GetProjectUseCase,
    VerifyUserTokenUseCase,
    GetAnalysisRunIssuesUseCase,
)
from app.services import (
    ProjectService,
    AnalysisRunService,
    VerifyUserService,
)
from app.interfaces.uow import IUnitOfWork
from app.interfaces.repo_manager import IRepoManager
from app.interfaces.auth_client import IAuthClient
from app.interfaces.analyser import IAnalyser


class IServiceContainer(Protocol):
    """Интерфейс для DI контейнера"""
    
    # Application Services
    project_service: ProjectService
    analysis_run_service: AnalysisRunService
    verify_user_service: VerifyUserService
    
    # Use Cases
    create_project_uc: CreateProjectUseCase
    start_analysis_uc: StartAnalysisUseCase
    get_user_projects_uc: GetUserProjectsUseCase
    delete_project_uc: DeleteProjectUseCase
    get_project_uc: GetProjectUseCase
    verify_user_token_uc: VerifyUserTokenUseCase


class ServiceContainer:
    """DI контейнер для регистрации и инициализации всех сервисов"""
    
    def __init__(self,
                 uow_factory: Callable[[], IUnitOfWork],
                 repo_manager: IRepoManager,
                 auth_client: IAuthClient,
                 analysers: list[IAnalyser]):
        self.uow_factory = uow_factory
        self.repo_manager = repo_manager
        self.auth_client = auth_client
        self.analysers = analysers
        
        # Инициализируем все компоненты
        self._initialize()
    
    def _initialize(self) -> None:
        """Инициализирует все сервисы и их зависимости"""
        
        # Domain Services
        self.analysis_domain_service = AnalysisService()
        self.project_domain_service = ProjectDomainService()
        
        # Use Cases
        self.create_project_uc = lambda: CreateProjectUseCase(
            repo_manager=self.repo_manager,
            uow=self.uow_factory()
        )
        
        self.start_analysis_uc = lambda: StartAnalysisUseCase(
            analysers=self.analysers,
            analysis_service=self.analysis_domain_service,
            uow=self.uow_factory()
        )
        
        self.get_user_projects_uc = lambda: GetUserProjectsUseCase(
            uow=self.uow_factory()
        )
        
        self.delete_project_uc = lambda: DeleteProjectUseCase(
            repo_manager=self.repo_manager,
            uow=self.uow_factory()
        )
        
        self.get_project_uc = lambda: GetProjectUseCase(
            uow=self.uow_factory()
        )

        self.get_analysis_run_issues_uc = lambda: GetAnalysisRunIssuesUseCase(
            uow=self.uow_factory()
        )
        
        self.verify_user_token_uc = lambda: VerifyUserTokenUseCase(
            auth_client=self.auth_client
        )
        
        # Application Services (Координаторы)
        self.project_service = lambda: ProjectService(
            create_project_uc=self.create_project_uc(),
            delete_project_uc=self.delete_project_uc(),
            domain_service=self.project_domain_service,
            uow=self.uow_factory()
        )
        
        self.analysis_run_service = lambda: AnalysisRunService(
            start_analysis_uc=self.start_analysis_uc(),
            domain_service=self.analysis_domain_service,
            uow=self.uow_factory()
        )
        
        self.verify_user_service = lambda: VerifyUserService(
            auth_client=self.auth_client,
            uow=self.uow_factory()
        )
    
    # Expose API для удобного доступа
    def get_project_service(self) -> ProjectService:
        return self.project_service()
    
    def get_analysis_run_service(self) -> AnalysisRunService:
        return self.analysis_run_service()
    
    def get_verify_user_service(self) -> VerifyUserService:
        return self.verify_user_service()


# Пример использования:
# =====================
# 
# # В main.py или в точке входа приложения:
# container = ServiceContainer(
#     uow=PostgresUnitOfWork(),
#     repo_manager=GitRepoManager(),
#     auth_client=ExternalAuthClient(),
#     analysers=[PythonAnalyser(), JavaScriptAnalyser()]
# )
# 
# # Использование в контроллерах/эндпоинтах:
# @app.post("/projects")
# def create_project(owner_id: int, repo: RepoSource):
#     project = container.project_service.create_project(owner_id, repo)
#     return project
# 
# @app.post("/analyses/{project_id}")
# def start_analysis(project_id: int):
#     project = container.project_service.get_project(project_id)
#     container.analysis_run_service.start_analysis(project_id, project)
#     return {"status": "analysis started"}
# 
# @app.get("/users/{user_id}/projects")
# def get_user_projects(user_id: int, token: str):
#     if not container.verify_user_service.verify_token(token):
#         return {"error": "Unauthorized"}
#     
#     projects = container.project_service.get_user_projects(user_id)
#     return projects
