use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer as SplTransfer};
use solana_program::system_instruction;
// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("4Qq4FkBT5xEGZgJnswapgjpJmoHWMdw5pzNDpQWksovc");

#[program]
mod arcaneProtocol {
    use super::*;

    // Function to initialize account with data
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let log_account = &mut ctx.accounts.log_account;
        log_account.logs.push(format!("Initialized program"));

        Ok(())
    }

    pub fn send_sol_from_caller(ctx: Context<SendSolFromCaller>, amount: u64) -> Result<()> {
        // Create a transfer instruction to send SOL from the caller (signer) to the receiver
        let from_account = &ctx.accounts.from;
        let to_account = &ctx.accounts.to;
        let transfer_instruction =
            system_instruction::transfer(from_account.key, to_account.key, amount);

        // Invoke the transfer instruction
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_instruction,
            &[
                from_account.to_account_info(),
                to_account.clone(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;
        // Save log details to the LogAccount
        let log_account = &mut ctx.accounts.log_account;
        log_account.logs.push(format!(
            "Sent {} lamports from {} to {}",
            amount,
            from_account.key,
            to_account.key
        ));

        msg!("Caller sent {} lamports", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Initialize LogAccount with the payer as the funder and the space defined
    #[account(init, payer = signer, space = 8 + 1024)]
    // Allocating space: 8 bytes for discriminator + 1024 bytes for logs
    pub log_account: Account<'info, LogAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct LogAccount {
    pub logs: Vec<String>, // A vector to store logs of transactions
}

#[derive(Accounts)]
pub struct SendSolFromCaller<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    #[account(init_if_needed, payer = from, space = 8 + 1024)] // Allocate space for storing logs
    pub log_account: Account<'info, LogAccount>, // Account to store logs
    pub system_program: Program<'info, System>,
}

