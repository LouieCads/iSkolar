const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("CredentialRegistry Unit Tests", function () {
      let credentialRegistry;
      let deployer,
        school1,
        school2,
        student1,
        student2,
        randomUser,
        emergencyAdmin;
      let deployerSigner, school1Signer, school2Signer, emergencyAdminSigner;

      const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ISSUER_ROLE"));
      const EMERGENCY_ADMIN_ROLE = ethers.keccak256(
        ethers.toUtf8Bytes("EMERGENCY_ADMIN_ROLE")
      );
      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

      // Sample test data
      const sampleCredentials = {
        docHash1: ethers.keccak256(ethers.toUtf8Bytes("transcript_data_1")),
        docHash2: ethers.keccak256(ethers.toUtf8Bytes("certificate_data_1")),
        schema1: "transcript",
        schema2: "certificate",
        metadataURI1: "ipfs://QmTestHash1",
        metadataURI2: "ipfs://QmTestHash2",
      };

      beforeEach(async function () {
        // Get signers
        const accounts = await ethers.getSigners();
        deployerSigner = accounts[0];
        school1Signer = accounts[1];
        school2Signer = accounts[2];
        emergencyAdminSigner = accounts[3];

        // Get named accounts
        const namedAccounts = await getNamedAccounts();
        deployer = namedAccounts.deployer;

        // Assign addresses
        school1 = school1Signer.address;
        school2 = school2Signer.address;
        emergencyAdmin = emergencyAdminSigner.address;
        student1 = accounts[4].address;
        student2 = accounts[5].address;
        randomUser = accounts[6].address;

        // Deploy contracts using hardhat-deploy
        await deployments.fixture(["credential-registry"]);

        // Get contract instance
        const credentialRegistryDeployment = await deployments.get(
          "CredentialRegistry"
        );
        credentialRegistry = await ethers.getContractAt(
          "CredentialRegistry",
          credentialRegistryDeployment.address,
          deployerSigner
        );
      });

      describe("Deployment", function () {
        it("Should deploy with correct admin role", async function () {
          expect(await credentialRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer))
            .to.be.true;
        });

        it("Should deploy with correct emergency admin role", async function () {
          expect(
            await credentialRegistry.hasRole(EMERGENCY_ADMIN_ROLE, deployer)
          ).to.be.true;
        });

        it("Should not grant issuer role to admin by default", async function () {
          expect(await credentialRegistry.hasRole(ISSUER_ROLE, deployer)).to.be
            .false;
        });

        it("Should start with zero credentials", async function () {
          expect(await credentialRegistry.getTotalCredentials()).to.equal(0);
        });

        it("Should have correct emergency timelock constant", async function () {
          expect(await credentialRegistry.EMERGENCY_TIMELOCK()).to.equal(
            7 * 24 * 60 * 60
          ); // 7 days
        });

        it("Should have correct max pagination limit", async function () {
          expect(await credentialRegistry.MAX_PAGINATION_LIMIT()).to.equal(100);
        });

        it("Should revert if deployed with zero address admin", async function () {
          const CredentialRegistryFactory = await ethers.getContractFactory(
            "CredentialRegistry"
          );
          await expect(
            CredentialRegistryFactory.deploy(ethers.ZeroAddress)
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__InvalidAddress"
          );
        });
      });

      describe("Role Management", function () {
        describe("Adding Issuers", function () {
          it("Should allow admin to add issuer", async function () {
            await expect(credentialRegistry.addIssuer(school1))
              .to.emit(credentialRegistry, "RoleGranted")
              .withArgs(ISSUER_ROLE, school1, deployer);

            expect(await credentialRegistry.isIssuer(school1)).to.be.true;
          });

          it("Should revert when non-admin tries to add issuer", async function () {
            await expect(
              credentialRegistry.connect(school1Signer).addIssuer(school2)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when adding zero address as issuer", async function () {
            await expect(
              credentialRegistry.addIssuer(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Removing Issuers", function () {
          beforeEach(async function () {
            await credentialRegistry.addIssuer(school1);
          });

          it("Should allow admin to remove issuer", async function () {
            await expect(credentialRegistry.removeIssuer(school1))
              .to.emit(credentialRegistry, "RoleRevoked")
              .withArgs(ISSUER_ROLE, school1, deployer);

            expect(await credentialRegistry.isIssuer(school1)).to.be.false;
          });

          it("Should revert when non-admin tries to remove issuer", async function () {
            await expect(
              credentialRegistry.connect(school1Signer).removeIssuer(school1)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when removing zero address issuer", async function () {
            await expect(
              credentialRegistry.removeIssuer(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Emergency Admin Management", function () {
          it("Should allow admin to add emergency admin", async function () {
            await expect(credentialRegistry.addEmergencyAdmin(emergencyAdmin))
              .to.emit(credentialRegistry, "RoleGranted")
              .withArgs(EMERGENCY_ADMIN_ROLE, emergencyAdmin, deployer);

            expect(
              await credentialRegistry.hasRole(
                EMERGENCY_ADMIN_ROLE,
                emergencyAdmin
              )
            ).to.be.true;
          });

          it("Should allow admin to remove emergency admin", async function () {
            await credentialRegistry.addEmergencyAdmin(emergencyAdmin);

            await expect(
              credentialRegistry.removeEmergencyAdmin(emergencyAdmin)
            )
              .to.emit(credentialRegistry, "RoleRevoked")
              .withArgs(EMERGENCY_ADMIN_ROLE, emergencyAdmin, deployer);

            expect(
              await credentialRegistry.hasRole(
                EMERGENCY_ADMIN_ROLE,
                emergencyAdmin
              )
            ).to.be.false;
          });

          it("Should revert when non-admin tries to add emergency admin", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .addEmergencyAdmin(emergencyAdmin)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when adding zero address as emergency admin", async function () {
            await expect(
              credentialRegistry.addEmergencyAdmin(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });
      });

      describe("Pausable Functionality", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
        });

        it("Should allow admin to pause contract", async function () {
          await expect(credentialRegistry.pause())
            .to.emit(credentialRegistry, "Paused")
            .withArgs(deployer);
        });

        it("Should allow admin to unpause contract", async function () {
          await credentialRegistry.pause();
          await expect(credentialRegistry.unpause())
            .to.emit(credentialRegistry, "Unpaused")
            .withArgs(deployer);
        });

        it("Should revert when non-admin tries to pause", async function () {
          await expect(
            credentialRegistry.connect(school1Signer).pause()
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "AccessControlUnauthorizedAccount"
          );
        });

        it("Should prevent credential issuance when paused", async function () {
          await credentialRegistry.pause();
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              )
          ).to.be.revertedWithCustomError(credentialRegistry, "EnforcedPause");
        });

        it("Should prevent credential revocation when paused", async function () {
          // Issue credential first
          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          const credentialId = receipt.logs[0].args.credentialId;

          // Pause and try to revoke
          await credentialRegistry.pause();
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Test revocation")
          ).to.be.revertedWithCustomError(credentialRegistry, "EnforcedPause");
        });
      });

      describe("Credential Issuance", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);
        });

        describe("Successful Issuance", function () {
          it("Should issue credential with valid parameters", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            await expect(tx)
              .to.emit(credentialRegistry, "CredentialIssued")
              .withArgs(
                credentialId,
                student1,
                school1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            expect(await credentialRegistry.getTotalCredentials()).to.equal(1);
          });

          it("Should store credential data correctly", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            const credential = await credentialRegistry.getCredential(
              credentialId
            );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credential.schema).to.equal(sampleCredentials.schema1);
            expect(credential.metadataURI).to.equal(
              sampleCredentials.metadataURI1
            );
            expect(credential.revoked).to.be.false;
            expect(credential.issuedAt).to.be.greaterThan(0);
          });

          it("Should update pagination-friendly mappings correctly", async function () {
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            // Check docHash mapping
            const [credential, retrievedId] =
              await credentialRegistry.getCredentialByHash(
                sampleCredentials.docHash1
              );
            expect(retrievedId).to.equal(credentialId);

            // Check student credential count
            expect(
              await credentialRegistry.getStudentCredentialCount(student1)
            ).to.equal(1);

            // Check issuer credential count
            expect(
              await credentialRegistry.getIssuerCredentialCount(school1)
            ).to.equal(1);

            // Check student credentials with pagination
            const [studentCreds, studentTotal] =
              await credentialRegistry.getStudentCredentials(student1, 0, 10);
            expect(studentCreds).to.include(credentialId);
            expect(studentTotal).to.equal(1);

            // Check issuer credentials with pagination
            const [issuerCreds, issuerTotal] =
              await credentialRegistry.getIssuerCredentials(school1, 0, 10);
            expect(issuerCreds).to.include(credentialId);
            expect(issuerTotal).to.equal(1);
          });

          it("Should generate unique credential IDs", async function () {
            const tx1 = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt1 = await tx1.wait();
            const credentialId1 = receipt1.logs[0].args.credentialId;

            const tx2 = await credentialRegistry
              .connect(school2Signer)
              .issueCredential(
                student2,
                sampleCredentials.docHash2,
                sampleCredentials.schema2,
                sampleCredentials.metadataURI2
              );
            const receipt2 = await tx2.wait();
            const credentialId2 = receipt2.logs[0].args.credentialId;

            expect(credentialId1).to.not.equal(credentialId2);
          });
        });

        describe("Input Validation", function () {
          it("Should revert with invalid student address", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  ethers.ZeroAddress,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidStudent"
            );
          });

          it("Should revert with invalid docHash", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  ethers.ZeroHash,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidDocHash"
            );
          });

          it("Should revert with empty schema", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  "",
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__EmptySchema"
            );
          });

          it("Should revert with empty metadata URI", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  ""
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__EmptyMetadataURI"
            );
          });

          it("Should revert when issuing duplicate docHash", async function () {
            await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );

            await expect(
              credentialRegistry
                .connect(school2Signer)
                .issueCredential(
                  student2,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema2,
                  sampleCredentials.metadataURI2
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__CredentialAlreadyIssued"
            );
          });

          it("Should revert when issuing credential with previously revoked docHash by same issuer", async function () {
            // Issue and then revoke a credential
            const tx = await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              );
            const receipt = await tx.wait();
            const credentialId = receipt.logs[0].args.credentialId;

            await credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Test revocation");

            // Try to reissue with the same docHash by the same issuer
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__DocumentPreviouslyRevoked"
            );
          });
        });

        describe("Authorization", function () {
          it("Should revert when non-issuer tries to issue credential", async function () {
            const randomUserSigner = await ethers.getSigner(randomUser);
            await expect(
              credentialRegistry
                .connect(randomUserSigner)
                .issueCredential(
                  student1,
                  sampleCredentials.docHash1,
                  sampleCredentials.schema1,
                  sampleCredentials.metadataURI1
                )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });
        });
      });

      describe("Credential Revocation", function () {
        let credentialId;

        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);

          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          credentialId = receipt.logs[0].args.credentialId;
        });

        it("Should allow issuer to revoke their own credential", async function () {
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Test revocation")
          )
            .to.emit(credentialRegistry, "CredentialRevoked")
            .withArgs(
              credentialId,
              school1,
              sampleCredentials.docHash1,
              "Test revocation"
            );

          const credential = await credentialRegistry.getCredential(
            credentialId
          );
          expect(credential.revoked).to.be.true;
        });

        it("Should mark document hash as revoked by issuer (scoped revocation)", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");

          // Check that the document hash is marked as revoked by this issuer
          expect(
            await credentialRegistry.isDocHashRevokedByIssuer(
              school1,
              sampleCredentials.docHash1
            )
          ).to.be.true;

          // But not by other issuers
          expect(
            await credentialRegistry.isDocHashRevokedByIssuer(
              school2,
              sampleCredentials.docHash1
            )
          ).to.be.false;
        });

        it("Should maintain docHash mapping when credential is revoked", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");

          // The docHash mapping should still exist
          const [, retrievedId] = await credentialRegistry.getCredentialByHash(
            sampleCredentials.docHash1
          );
          expect(retrievedId).to.equal(credentialId);
        });

        it("Should revert when trying to revoke non-existent credential", async function () {
          const fakeCredentialId = ethers.keccak256(ethers.toUtf8Bytes("fake"));

          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(fakeCredentialId, "Test")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__CredentialNotFound"
          );
        });

        it("Should revert when trying to revoke already revoked credential", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "First revocation");

          await expect(
            credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Second revocation")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__AlreadyRevoked"
          );
        });

        it("Should revert when non-issuer tries to revoke credential", async function () {
          const randomUserSigner = await ethers.getSigner(randomUser);
          await expect(
            credentialRegistry
              .connect(randomUserSigner)
              .revokeCredential(credentialId, "Test")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__NotAuthorized"
          );
        });

        it("Should revert when different issuer (without admin role) tries to revoke credential", async function () {
          // School2 is an issuer but not the original issuer and not admin
          await expect(
            credentialRegistry
              .connect(school2Signer)
              .revokeCredential(credentialId, "Unauthorized revocation")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__NotAuthorized"
          );
        });
      });

      describe("Emergency Revocation", function () {
        let credentialId;

        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addEmergencyAdmin(emergencyAdmin);

          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          credentialId = receipt.logs[0].args.credentialId;
        });

        describe("Initiate Emergency Revocation", function () {
          it("Should allow emergency admin to initiate emergency revocation", async function () {
            const tx = await credentialRegistry
              .connect(emergencyAdminSigner)
              .initiateEmergencyRevocation(credentialId, "Emergency situation");

            const receipt = await tx.wait();
            const emergencyId = receipt.logs[0].args.emergencyId;

            await expect(tx)
              .to.emit(credentialRegistry, "EmergencyRevocationInitiated")
              .withArgs(
                emergencyId,
                credentialId,
                emergencyAdmin,
                "Emergency situation"
              );

            const emergency = await credentialRegistry.emergencyRevocations(
              emergencyId
            );
            expect(emergency.credentialId).to.equal(credentialId);
            expect(emergency.reason).to.equal("Emergency situation");
            expect(emergency.executed).to.be.false;
          });

          it("Should revert when non-emergency admin tries to initiate", async function () {
            await expect(
              credentialRegistry
                .connect(school1Signer)
                .initiateEmergencyRevocation(credentialId, "Test")
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when initiating emergency revocation for non-existent credential", async function () {
            const fakeCredentialId = ethers.keccak256(
              ethers.toUtf8Bytes("fake")
            );

            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .initiateEmergencyRevocation(fakeCredentialId, "Test")
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__CredentialNotFound"
            );
          });

          it("Should revert when initiating emergency revocation for already revoked credential", async function () {
            // First revoke normally
            await credentialRegistry
              .connect(school1Signer)
              .revokeCredential(credentialId, "Normal revocation");

            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .initiateEmergencyRevocation(credentialId, "Emergency")
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__AlreadyRevoked"
            );
          });
        });

        describe("Execute Emergency Revocation", function () {
          let emergencyId;

          beforeEach(async function () {
            const tx = await credentialRegistry
              .connect(emergencyAdminSigner)
              .initiateEmergencyRevocation(credentialId, "Emergency situation");
            const receipt = await tx.wait();
            emergencyId = receipt.logs[0].args.emergencyId;
          });

          it("Should execute emergency revocation after timelock", async function () {
            // Fast forward time by 7 days
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .executeEmergencyRevocation(emergencyId)
            )
              .to.emit(credentialRegistry, "EmergencyRevocationExecuted")
              .withArgs(emergencyId, credentialId)
              .and.to.emit(credentialRegistry, "CredentialRevoked");

            const credential = await credentialRegistry.getCredential(
              credentialId
            );
            expect(credential.revoked).to.be.true;

            const emergency = await credentialRegistry.emergencyRevocations(
              emergencyId
            );
            expect(emergency.executed).to.be.true;
          });

          it("Should revert when trying to execute before timelock expires", async function () {
            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .executeEmergencyRevocation(emergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__TimelockNotExpired"
            );
          });

          it("Should revert when trying to execute non-existent emergency", async function () {
            const fakeEmergencyId = ethers.keccak256(
              ethers.toUtf8Bytes("fake")
            );

            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .executeEmergencyRevocation(fakeEmergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__NoEmergencyRevocationPending"
            );
          });

          it("Should revert when trying to execute already executed emergency", async function () {
            // Fast forward and execute first time
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await credentialRegistry
              .connect(emergencyAdminSigner)
              .executeEmergencyRevocation(emergencyId);

            // Try to execute again
            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .executeEmergencyRevocation(emergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__AlreadyRevoked"
            );
          });

          it("Should mark document hash as revoked by original issuer", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await credentialRegistry
              .connect(emergencyAdminSigner)
              .executeEmergencyRevocation(emergencyId);

            expect(
              await credentialRegistry.isDocHashRevokedByIssuer(
                school1,
                sampleCredentials.docHash1
              )
            ).to.be.true;
          });
        });

        describe("Cancel Emergency Revocation", function () {
          let emergencyId;

          beforeEach(async function () {
            const tx = await credentialRegistry
              .connect(emergencyAdminSigner)
              .initiateEmergencyRevocation(credentialId, "Emergency situation");
            const receipt = await tx.wait();
            emergencyId = receipt.logs[0].args.emergencyId;
          });

          it("Should allow admin to cancel pending emergency revocation", async function () {
            await expect(
              credentialRegistry
                .connect(deployerSigner)
                .cancelEmergencyRevocation(emergencyId)
            )
              .to.emit(credentialRegistry, "EmergencyRevocationCancelled")
              .withArgs(emergencyId, credentialId);

            // Emergency should be deleted
            const emergency = await credentialRegistry.emergencyRevocations(
              emergencyId
            );
            expect(emergency.timestamp).to.equal(0);
          });

          it("Should revert when non-admin tries to cancel", async function () {
            await expect(
              credentialRegistry
                .connect(emergencyAdminSigner)
                .cancelEmergencyRevocation(emergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "AccessControlUnauthorizedAccount"
            );
          });

          it("Should revert when trying to cancel non-existent emergency", async function () {
            const fakeEmergencyId = ethers.keccak256(
              ethers.toUtf8Bytes("fake")
            );

            await expect(
              credentialRegistry
                .connect(deployerSigner)
                .cancelEmergencyRevocation(fakeEmergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__NoEmergencyRevocationPending"
            );
          });

          it("Should revert when trying to cancel already executed emergency", async function () {
            // Fast forward and execute
            await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await credentialRegistry
              .connect(emergencyAdminSigner)
              .executeEmergencyRevocation(emergencyId);

            // Try to cancel
            await expect(
              credentialRegistry
                .connect(deployerSigner)
                .cancelEmergencyRevocation(emergencyId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__AlreadyRevoked"
            );
          });
        });
      });

      describe("Credential Validation", function () {
        let credentialId;

        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);

          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          credentialId = receipt.logs[0].args.credentialId;
        });

        it("Should return true for valid credential", async function () {
          expect(await credentialRegistry.isValid(sampleCredentials.docHash1))
            .to.be.true;
        });

        it("Should return false for non-existent credential", async function () {
          expect(await credentialRegistry.isValid(sampleCredentials.docHash2))
            .to.be.false;
        });

        it("Should return false for revoked credential", async function () {
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");
          expect(await credentialRegistry.isValid(sampleCredentials.docHash1))
            .to.be.false;
        });
      });

      describe("Pagination Functionality", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);

          // Issue multiple credentials for testing pagination
          for (let i = 0; i < 5; i++) {
            const docHash = ethers.keccak256(ethers.toUtf8Bytes(`doc_${i}`));
            await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                docHash,
                "transcript",
                `ipfs://hash${i}`
              );
          }

          for (let i = 5; i < 8; i++) {
            const docHash = ethers.keccak256(ethers.toUtf8Bytes(`doc_${i}`));
            await credentialRegistry
              .connect(school2Signer)
              .issueCredential(
                student1,
                docHash,
                "certificate",
                `ipfs://hash${i}`
              );
          }
        });

        describe("Student Credentials Pagination", function () {
          it("Should return correct student credentials with pagination", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getStudentCredentials(student1, 0, 5);

            expect(credentials.length).to.equal(5);
            expect(totalCount).to.equal(8);
          });

          it("Should return remaining credentials on second page", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getStudentCredentials(student1, 5, 5);

            expect(credentials.length).to.equal(3);
            expect(totalCount).to.equal(8);
          });

          it("Should return empty array when offset exceeds total", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getStudentCredentials(student1, 10, 5);

            expect(credentials.length).to.equal(0);
            expect(totalCount).to.equal(8);
          });

          it("Should adjust limit when it exceeds remaining items", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getStudentCredentials(student1, 6, 5);

            expect(credentials.length).to.equal(2); // Only 2 remaining
            expect(totalCount).to.equal(8);
          });

          it("Should revert with invalid pagination parameters", async function () {
            await expect(
              credentialRegistry.getStudentCredentials(student1, 0, 0)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidPagination"
            );

            await expect(
              credentialRegistry.getStudentCredentials(student1, 0, 101)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidPagination"
            );
          });

          it("Should revert with zero address", async function () {
            await expect(
              credentialRegistry.getStudentCredentials(
                ethers.ZeroAddress,
                0,
                10
              )
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Issuer Credentials Pagination", function () {
          it("Should return correct issuer credentials with pagination", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getIssuerCredentials(school1, 0, 10);

            expect(credentials.length).to.equal(5);
            expect(totalCount).to.equal(5);
          });

          it("Should return correct credentials for different issuer", async function () {
            const [credentials, totalCount] =
              await credentialRegistry.getIssuerCredentials(school2, 0, 10);

            expect(credentials.length).to.equal(3);
            expect(totalCount).to.equal(3);
          });

          it("Should return empty array for issuer with no credentials", async function () {
            await credentialRegistry.addIssuer(randomUser);
            const [credentials, totalCount] =
              await credentialRegistry.getIssuerCredentials(randomUser, 0, 10);

            expect(credentials.length).to.equal(0);
            expect(totalCount).to.equal(0);
          });

          it("Should revert with invalid pagination parameters", async function () {
            await expect(
              credentialRegistry.getIssuerCredentials(school1, 0, 0)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidPagination"
            );

            await expect(
              credentialRegistry.getIssuerCredentials(school1, 0, 101)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidPagination"
            );
          });

          it("Should revert with zero address", async function () {
            await expect(
              credentialRegistry.getIssuerCredentials(ethers.ZeroAddress, 0, 10)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });

        describe("Credential Count Functions", function () {
          it("Should return correct student credential count", async function () {
            expect(
              await credentialRegistry.getStudentCredentialCount(student1)
            ).to.equal(8);
            expect(
              await credentialRegistry.getStudentCredentialCount(student2)
            ).to.equal(0);
          });

          it("Should return correct issuer credential count", async function () {
            expect(
              await credentialRegistry.getIssuerCredentialCount(school1)
            ).to.equal(5);
            expect(
              await credentialRegistry.getIssuerCredentialCount(school2)
            ).to.equal(3);
          });

          it("Should revert with zero address", async function () {
            await expect(
              credentialRegistry.getStudentCredentialCount(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );

            await expect(
              credentialRegistry.getIssuerCredentialCount(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__InvalidAddress"
            );
          });
        });
      });

      describe("Getter Functions", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);

          // Issue multiple credentials
          await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );

          await credentialRegistry
            .connect(school2Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash2,
              sampleCredentials.schema2,
              sampleCredentials.metadataURI2
            );
        });

        describe("getCredential", function () {
          it("Should return correct credential data", async function () {
            const [studentCreds] =
              await credentialRegistry.getStudentCredentials(student1, 0, 10);
            const credential = await credentialRegistry.getCredential(
              studentCreds[0]
            );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credential.schema).to.equal(sampleCredentials.schema1);
            expect(credential.metadataURI).to.equal(
              sampleCredentials.metadataURI1
            );
            expect(credential.revoked).to.be.false;
          });

          it("Should revert for non-existent credential", async function () {
            const fakeCredentialId = ethers.keccak256(
              ethers.toUtf8Bytes("fake")
            );

            await expect(
              credentialRegistry.getCredential(fakeCredentialId)
            ).to.be.revertedWithCustomError(
              credentialRegistry,
              "CredentialRegistry__CredentialNotFound"
            );
          });
        });

        describe("getCredentialByHash", function () {
          it("Should return correct credential by docHash", async function () {
            const [credential, credentialId] =
              await credentialRegistry.getCredentialByHash(
                sampleCredentials.docHash1
              );

            expect(credential.student).to.equal(student1);
            expect(credential.issuer).to.equal(school1);
            expect(credential.docHash).to.equal(sampleCredentials.docHash1);
            expect(credentialId).to.not.equal(ethers.ZeroHash);
          });

          it("Should return empty credential for non-existent docHash", async function () {
            const fakeDocHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));
            const [credential, credentialId] =
              await credentialRegistry.getCredentialByHash(fakeDocHash);

            expect(credential.issuer).to.equal(ethers.ZeroAddress);
            expect(credentialId).to.equal(ethers.ZeroHash);
          });
        });

        describe("getTotalCredentials", function () {
          it("Should return correct total count", async function () {
            expect(await credentialRegistry.getTotalCredentials()).to.equal(2);
          });
        });

        describe("isIssuer", function () {
          it("Should return true for authorized issuer", async function () {
            expect(await credentialRegistry.isIssuer(school1)).to.be.true;
          });

          it("Should return false for non-issuer", async function () {
            expect(await credentialRegistry.isIssuer(randomUser)).to.be.false;
          });
        });

        describe("isDocHashRevokedByIssuer", function () {
          it("Should return false for non-revoked document", async function () {
            expect(
              await credentialRegistry.isDocHashRevokedByIssuer(
                school1,
                sampleCredentials.docHash1
              )
            ).to.be.false;
          });

          it("Should return true after issuer revokes document", async function () {
            const [studentCreds] =
              await credentialRegistry.getStudentCredentials(student1, 0, 10);
            await credentialRegistry
              .connect(school1Signer)
              .revokeCredential(studentCreds[0], "Test revocation");

            expect(
              await credentialRegistry.isDocHashRevokedByIssuer(
                school1,
                sampleCredentials.docHash1
              )
            ).to.be.true;
          });

          it("Should be scoped to specific issuer", async function () {
            const [studentCreds] =
              await credentialRegistry.getStudentCredentials(student1, 0, 10);
            await credentialRegistry
              .connect(school1Signer)
              .revokeCredential(studentCreds[0], "Test revocation");

            // Should be true for school1
            expect(
              await credentialRegistry.isDocHashRevokedByIssuer(
                school1,
                sampleCredentials.docHash1
              )
            ).to.be.true;

            // Should be false for school2
            expect(
              await credentialRegistry.isDocHashRevokedByIssuer(
                school2,
                sampleCredentials.docHash1
              )
            ).to.be.false;
          });
        });
      });

      describe("Scoped Revocation Security", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);
        });

        it("Should allow different issuers to issue credentials with same docHash after one issuer revokes", async function () {
          // School1 issues credential
          const tx1 = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt1 = await tx1.wait();
          const credentialId1 = receipt1.logs[0].args.credentialId;

          // School1 revokes their credential
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId1, "Test revocation");

          // School1 should NOT be able to reissue same docHash
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student2,
                sampleCredentials.docHash1,
                sampleCredentials.schema2,
                sampleCredentials.metadataURI2
              )
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__DocumentPreviouslyRevoked"
          );

          // But school2 should NOT be able to issue same docHash either (global docHash uniqueness)
          await expect(
            credentialRegistry
              .connect(school2Signer)
              .issueCredential(
                student2,
                sampleCredentials.docHash1,
                sampleCredentials.schema2,
                sampleCredentials.metadataURI2
              )
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__CredentialAlreadyIssued"
          );
        });

        it("Should prevent reissuance attack after emergency revocation", async function () {
          // Issue credential
          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          const credentialId = receipt.logs[0].args.credentialId;

          // Emergency admin initiates and executes revocation
          await credentialRegistry.addEmergencyAdmin(emergencyAdmin);
          const emergencyTx = await credentialRegistry
            .connect(emergencyAdminSigner)
            .initiateEmergencyRevocation(credentialId, "Emergency");
          const emergencyReceipt = await emergencyTx.wait();
          const emergencyId = emergencyReceipt.logs[0].args.emergencyId;

          // Fast forward and execute
          await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
          await ethers.provider.send("evm_mine");
          await credentialRegistry
            .connect(emergencyAdminSigner)
            .executeEmergencyRevocation(emergencyId);

          // Original issuer should NOT be able to reissue
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                sampleCredentials.docHash1,
                sampleCredentials.schema1,
                sampleCredentials.metadataURI1
              )
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__DocumentPreviouslyRevoked"
          );
        });

        it("Should maintain credential history and mappings after revocation", async function () {
          // Issue credential
          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          const credentialId = receipt.logs[0].args.credentialId;

          // Revoke credential
          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId, "Test revocation");

          // Should still be able to retrieve credential data
          const credential = await credentialRegistry.getCredential(
            credentialId
          );
          expect(credential.student).to.equal(student1);
          expect(credential.issuer).to.equal(school1);
          expect(credential.docHash).to.equal(sampleCredentials.docHash1);
          expect(credential.revoked).to.be.true;

          // Should still appear in paginated student credentials
          const [studentCreds, studentTotal] =
            await credentialRegistry.getStudentCredentials(student1, 0, 10);
          expect(studentCreds).to.include(credentialId);
          expect(studentTotal).to.equal(1);

          // Should still appear in paginated issuer credentials
          const [issuerCreds, issuerTotal] =
            await credentialRegistry.getIssuerCredentials(school1, 0, 10);
          expect(issuerCreds).to.include(credentialId);
          expect(issuerTotal).to.equal(1);

          // DocHash mapping should still exist
          const [retrievedCred, retrievedId] =
            await credentialRegistry.getCredentialByHash(
              sampleCredentials.docHash1
            );
          expect(retrievedId).to.equal(credentialId);
          expect(retrievedCred.revoked).to.be.true;
        });
      });

      describe("Edge Cases and Advanced Security", function () {
        beforeEach(async function () {
          await credentialRegistry.addIssuer(school1);
          await credentialRegistry.addIssuer(school2);
        });

        it("Should handle multiple credentials for same student across different issuers", async function () {
          // Multiple credentials from different schools
          await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );

          await credentialRegistry
            .connect(school2Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash2,
              sampleCredentials.schema2,
              sampleCredentials.metadataURI2
            );

          const [studentCreds, totalCount] =
            await credentialRegistry.getStudentCredentials(student1, 0, 10);
          expect(studentCreds.length).to.equal(2);
          expect(totalCount).to.equal(2);
        });

        it("Should prevent cross-issuer revocation attacks", async function () {
          // School1 issues credential
          const tx = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(
              student1,
              sampleCredentials.docHash1,
              sampleCredentials.schema1,
              sampleCredentials.metadataURI1
            );
          const receipt = await tx.wait();
          const credentialId = receipt.logs[0].args.credentialId;

          // School2 should NOT be able to revoke School1's credential
          await expect(
            credentialRegistry
              .connect(school2Signer)
              .revokeCredential(credentialId, "Unauthorized revocation")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__NotAuthorized"
          );
        });

        it("Should handle pagination edge cases correctly", async function () {
          // Issue exactly MAX_PAGINATION_LIMIT credentials
          for (let i = 0; i < 100; i++) {
            const docHash = ethers.keccak256(ethers.toUtf8Bytes(`doc_${i}`));
            await credentialRegistry
              .connect(school1Signer)
              .issueCredential(
                student1,
                docHash,
                "transcript",
                `ipfs://hash${i}`
              );
          }

          // Should return exactly 100 credentials
          const [credentials, totalCount] =
            await credentialRegistry.getStudentCredentials(student1, 0, 100);
          expect(credentials.length).to.equal(100);
          expect(totalCount).to.equal(100);

          // Should handle offset at boundary
          const [credentials2] = await credentialRegistry.getStudentCredentials(
            student1,
            99,
            10
          );
          expect(credentials2.length).to.equal(1); // Only 1 remaining
        });

        it("Should maintain proper separation between issuer document revocations", async function () {
          const docHash = sampleCredentials.docHash1;

          // School1 issues and revokes a credential with specific docHash
          const tx1 = await credentialRegistry
            .connect(school1Signer)
            .issueCredential(student1, docHash, "transcript", "ipfs://test1");
          const receipt1 = await tx1.wait();
          const credentialId1 = receipt1.logs[0].args.credentialId;

          await credentialRegistry
            .connect(school1Signer)
            .revokeCredential(credentialId1, "Test revocation");

          // Check scoped revocation status
          expect(
            await credentialRegistry.isDocHashRevokedByIssuer(school1, docHash)
          ).to.be.true;
          expect(
            await credentialRegistry.isDocHashRevokedByIssuer(school2, docHash)
          ).to.be.false;

          // School1 should not be able to reissue same docHash
          await expect(
            credentialRegistry
              .connect(school1Signer)
              .issueCredential(student2, docHash, "certificate", "ipfs://test2")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__DocumentPreviouslyRevoked"
          );

          // But the existing docHash in the global mapping should prevent school2 from issuing it too
          await expect(
            credentialRegistry
              .connect(school2Signer)
              .issueCredential(student2, docHash, "certificate", "ipfs://test2")
          ).to.be.revertedWithCustomError(
            credentialRegistry,
            "CredentialRegistry__CredentialAlreadyIssued"
          );
        });
      });
    });
