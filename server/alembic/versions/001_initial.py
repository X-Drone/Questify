"""Initial migration - Create questify schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[Sequence[str], None] = None


def upgrade() -> None:
    # Create tests table
    op.create_table(
        'tests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.String(255), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='draft'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tests_creator_id'), 'tests', ['creator_id'], unique=False)
    op.create_index(op.f('ix_tests_status'), 'tests', ['status'], unique=False)

    # Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('test_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('question_type', sa.String(50), nullable=False),
        sa.Column('media_url', sa.String(500), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_test_id'), 'questions', ['test_id'], unique=False)

    # Create answer_options table
    op.create_table(
        'answer_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_answer_options_question_id'), 'answer_options', ['question_id'], unique=False)

    # Create attempts table
    op.create_table(
        'attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('test_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='started'),
        sa.Column('score_points', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('score_max_points', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attempts_user_id'), 'attempts', ['user_id'], unique=False)
    op.create_index(op.f('ix_attempts_test_id'), 'attempts', ['test_id'], unique=False)
    op.create_index(op.f('ix_attempts_status'), 'attempts', ['status'], unique=False)

    # Create user_answers table
    op.create_table(
        'user_answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('attempt_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('answer_payload', sa.JSON(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=True),
        sa.Column('points_earned', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['attempt_id'], ['attempts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_answers_attempt_id'), 'user_answers', ['attempt_id'], unique=False)
    op.create_index(op.f('ix_user_answers_question_id'), 'user_answers', ['question_id'], unique=False)


def downgrade() -> None:
    # Drop user_answers table
    op.drop_index(op.f('ix_user_answers_question_id'), table_name='user_answers')
    op.drop_index(op.f('ix_user_answers_attempt_id'), table_name='user_answers')
    op.drop_table('user_answers')

    # Drop attempts table
    op.drop_index(op.f('ix_attempts_status'), table_name='attempts')
    op.drop_index(op.f('ix_attempts_test_id'), table_name='attempts')
    op.drop_index(op.f('ix_attempts_user_id'), table_name='attempts')
    op.drop_table('attempts')

    # Drop answer_options table
    op.drop_index(op.f('ix_answer_options_question_id'), table_name='answer_options')
    op.drop_table('answer_options')

    # Drop questions table
    op.drop_index(op.f('ix_questions_test_id'), table_name='questions')
    op.drop_table('questions')

    # Drop tests table
    op.drop_index(op.f('ix_tests_status'), table_name='tests')
    op.drop_index(op.f('ix_tests_creator_id'), table_name='tests')
    op.drop_table('tests')
